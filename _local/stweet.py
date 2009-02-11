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

"""
simple script used to display notifications for twitter
and save them in db
"""
from datetime import datetime
import os
import httplib
import socket
import sys
import time

from eventlet import api
import pygtk
pygtk.require('2.0')
import pynotify 
from restclient import Resource, RequestFailed, ResourceNotFound
from restclient.transport import createHTTPTransport

try:
    import simplejson as json
except ImportError:
    import json

from simplecouchdb import Server
from simplecouchdb.schema import *


__version__ = '0.1'
USER_AGENT = 'stweet/%s' % __version__
PIDFILE = '/home/benoitc/.stweet.pid'


COUCHDB_NODE = 'http://127.0.0.1:5984'
COUCHDB_DB = 'benoitc'


class TwitterResource(Resource):

    TWITTER_URL = 'http://twitter.com'

    def __init__(self, username, password):
        # create transport
        transport = createHTTPTransport()
        transport.add_credentials(username, password)

        # init resource
        Resource.__init__(self, uri=self.TWITTER_URL, transport=transport)

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
        data = _make_request()
        if data:
            try:
                data = json.loads(data)
            except ValueError:
                pass
        return data

    def friends_timeline(self, headers=None):
        return self.get('/statuses/friends_timeline.json',
                headers=headers)

    def replies(self):
        return self.get('/statuses/replies.json')
    
class TwitterService(object):
    def __init__(self, username, password, dbname):
        self.res = TwitterResource(username, password)
        server = Server()
        try:
            self.db = server.create_db(dbname)
        except:
            self.db = server[dbname]
        self.lastmod = None

    def run(self):
        if not pynotify.init("Stweet"):
            sys.exit(1)
        
        while True:
            api.spawn(self.get_timeline)
            api.sleep()
            time.sleep(60)
            
    def get_timeline(self):
        headers = {}
        if self.lastmod is not None:
            headers['If-Modified-Since'] = self.lastmod.strftime("%a, %d %b %Y %H:%M:%S GMT")
        result = self.res.friends_timeline(headers=headers)
        
        self.lastmod = datetime.datetime.utcnow()
        if result:
            api.spawn(self.notify, result)
            api.sleep

    def notify(self, tweets):
        self.save(tweets)
   
        for tweet in tweets:
            api.spawn(self.desktop_notify, tweet)
        api.sleep(0.4)

    def desktop_notify(self, tweet):
        title = "Twitter: %s" % tweet['user']['screen_name']
        message = tweet['text']
        n = pynotify.Notification(title, message)
    
        if not n.show():
            print "Failed to send notification"
            sys.exit(1)

    def save(self, tweets):
        self.db.save(tweets)


def deaemonize():
    # do the UNIX double-fork magic, see Stevens' "Advanced
    # Programming in the UNIX Environment" for details (ISBN 0201563177)
    try:
        pid = os.fork()
        if pid > 0:
            # exit first parent
            sys.exit(0)
    except OSError, e:
        print >>sys.stderr, "fork #1 failed: %d (%s)" % (e.errno, e.strerror)
        sys.exit(1)

    # decouple from parent environment
    os.chdir("/")   #don't prevent unmounting....
    os.setsid()
    os.umask(0)

    # do second fork
    try:
        pid = os.fork()
        if pid > 0:
            # exit from second parent, print eventual PID before
            #print "Daemon PID %d" % pid
            open(PIDFILE,'w').write("%d"%pid)
            sys.exit(0)
    except OSError, e:
        print >>sys.stderr, "fork #2 failed: %d (%s)" % (e.errno, e.strerror)
        sys.exit(1)

if __name__ == '__main__':
    daemonize()
    service = TwitterService('benoitc', 'as61zx', 'benoitc')
    service.run()


