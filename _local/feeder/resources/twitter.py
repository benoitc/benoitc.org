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


import httplib
import socket

from restclient import Resource, RequestFailed, ResourceNotFound
from restclient.transport import createHTTPTransport



try:
    import simplejson as json
except ImportError:
    import json


__version__ = '0.1'
USER_AGENT = 'benoitc.org/%s' % __version__


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

    def friends_timeline(self, headers=None, **kwargs):
        return self.get('/statuses/friends_timeline.json',
                headers=headers)

    def replies(self, headers=None, **kwargs):
        return self.get('/statuses/replies.json')

    def user_timeline(self, headers=None, **kwargs):
        return self.get('/statuses/user_timeline.json') 
