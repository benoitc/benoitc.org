# -*- coding: utf-8 -*-
#
# Copyright (c) 2008-2009 Benoit Chesneau <benoitc@e-engura.com> 
#
# Permission to use, copy, modify, and distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
#

from itertools import groupby
from optparse import OptionParser, OptionGroup
import os
import httplib
import socket
import sys
import time
import uuid

from eventlet import api
from restclient import Resource, RequestFailed, ResourceNotFound
from restclient.transport import createHTTPTransport
from simplecouchdb import Server

try:
    import simplejson as json
except ImportError:
    try:
        import json
    except ImportError:
        print >>sys.stderr, "You need to install simplejson for python < 2.6"

from yaml import load, dump
try:
    from yaml import CLoader as Loader
    from yaml import CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper


__version__ = '0.1'
USER_AGENT = 'stweet/%s' % __version__
PIDFILE = '/tmp/.feeder.pid'
FEEDER_RUN = '.feeder'


class JSONResource(Resource):
    def __init__(self, uri, username=None, password=None):
        transport = createHTTPTransport()
        if username:
            transport.add_credentials(username, password)
        Resource.__init__(self, uri=uri, transport=transport)

    def request(self, method, path=None, payload=None, headers=None, **params):    
        headers = headers or {}
        headers.setdefault('Accept', 'application/json')
        headers.setdefault('User-Agent', USER_AGENT)

        def _make_request(retry=3):
            try:
                return Resource.request(self, method, path=path,
                        payload=payload, headers=headers, **params)
            except (socket.error, httplib.BadStatusLine), e:
                if retry > 0:
                    time.sleep(0.4)
                    return _make_request(retry - 1)
                raise
            except:
                raise
        
        # we just let connexion raise if anything wrong happend
        raw_data = _make_request()
        if raw_data:
            try:
                raw_data = json.loads(raw_data)
            except ValueError:
                pass

        return raw_data

class FriendFeedResource(JSONResource):
    FRIENDFEED_URI = 'http://friendfeed.com/api'

    def __init__(self, username=None, password=None):
        JSONResource.__init__(self, uri=self.FRIENDFEED_URI, username=username,
                password=password)

    def user_feed(self, nickname, **params):
        if isinstance(nickname, list):
            path = '/feed/user?%s' % ','.join(nickname)
        else:
            path = '/feed/user/%s' % nickname
        return self.get(path, **params)


class RealtimeFriendFeedResource(FriendFeedResource):
    FRIENDFEED_URI = 'http://chan.friendfeed.com/api/updates'

    def home_update(self, token=None):
        if token is None:
            token = self.get()['update']['token']
        return self.get('/home', token=token, timeout=0)


class FriendFeedService(object):
    def __init__(self, username, password, conf):
        self.res = RealtimeFriendFeedResource(username, password)
        server = Server(conf['couchdb']['server'])
        self.db = server[conf['couchdb']['dbname']]
        self.token = None
        self.poll_interval = 60

        self.token_file = conf['run'] or FEEDER_RUN
        if os.path.isfile(self.token_file):
            f = open(self.token_file, 'r')
            self.token = f.read()
            f.close()

    def run(self):
        while True:
            api.spawn(self.get_updates)
            api.sleep()
            time.sleep(self.poll_interval)

    def get_updates(self):
        def _is_new(value):
            if value['is_new']:
                return "new"
            return "update"

        rst = self.res.home_update(self.token)
        self.token = rst['update']['token']
        self.poll_interval = int(rst['update']['poll_interval'])
        if not rst['entries']:
            return
        
        entries = rst['entries']
        for k, g in groupby(entries, _is_new):
            if k == 'update':
                update_ids = []
                docs = []
                for entry in list(g):
                    entry['_id'] = uuid.UUID(entry.pop('id')).hex
                    entry['doc_type'] = 'FeedItem'
                    update_ids.append(entry['_id'])
                    docs.append(entry)

                current = self.db.documents(keys=update_ids)
                for i, row in enumerate(current):
                    docs[i].update({'_rev': row.value('_rev')})
            else:
                for entry in list(g):
                    entry['_id'] = uuid.UUID(entry.pop('id')).hex
        self.db.save(entries)
        f = open(self.token_file, 'w')
        f.write(self.token)
        f.close()



def create_db(f, nickname, conf):
    s = Server(conf['server'])
    try:
        db = s[conf['dbname']]
    except KeyError:
        db = s.create_db(conf['dbname'])

    entries = f.user_feed(nickname, num=20)['entries']
    for entry in entries:
        entry['_id'] = uuid.UUID(entry.pop('id')).hex
        entry['doc_type'] = 'FeedItem'

    db.save(entries)
    
def daemonize(conf):
    try:
        pid = os.fork()
        if pid > 0:
            # exit first parent
            sys.exit(0)
    except OSError, e:
        print >>sys.stderr, "fork #1 failed: %d (%s)" % (e.errno, e.strerror)
        sys.exit(1)

    os.chdir("/") 
    os.setsid()
    os.umask(0)

    try:
        pid = os.fork()
        if pid > 0:
            pidf = conf.get('pid', PIDFILE)
            open(pidf,'w').write("%d"%pid)
            sys.exit(0)
    except OSError, e:
        print >>sys.stderr, "fork #2 failed: %d (%s)" % (e.errno, e.strerror)
        sys.exit(1)


def main():
    fconf = open('feeder.yml', 'r')
    conf = load(fconf.read(), Loader=Loader)
    fconf.close()
    
    f = FriendFeedResource(conf['friendfeed']['username'],
            conf['friendfeed']['remote_key'])

    parser = OptionParser(usage='%prog [options]', version="%prog ")    
    parser.add_option('--create-db', action='store_true',
            dest='create_db', help='n" ')
    options, args = parser.parse_args()
    
    if options.create_db:
        create_db(f, conf['friendfeed']['username'], conf['couchdb'])
    else:
        daemonize(conf)
        service = FriendFeedService(conf['friendfeed']['username'],
            conf['friendfeed']['remote_key'], conf)
        service.run()

if __name__ == '__main__':
    main() 
