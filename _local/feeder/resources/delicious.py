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
from calendar import timegm
import decimal
import datetime
import time
from xml.etree import ElementTree as ET

from restclient import Resource, RequestFailed, ResourceNotFound
from restclient.transport import createHTTPTransport

try:
    import simplejson as json
except ImportError:
    import json

from simplecouchdb.schema import *

__version__ = '0.1'
USER_AGENT = 'benoitc.org/%s' % __version__

d = DateTimeProperty()

class DeliciousResource(Resource):

    DELICIOUS_URL = 'https://api.del.icio.us'

    def __init__(self, username, password):
        # create transport
        transport = createHTTPTransport()
        transport.add_credentials(username, password)

        # init resource
        Resource.__init__(self, uri=self.DELICIOUS_URL, transport=transport)

    def get_all(self):
        rst = self.get('/v1/posts/all', meta='yes')
        tree = ET.XML(rst.encode('utf-8', 'replace'))

        posts = []
        for post in tree:
            tag = post.attrib.get('tag', '')
            if tag:
                post.attrib['tag'] = tag.split(' ')
            if 'time' in post.attrib:
                post.attrib['time'] = d._to_python(post.attrib['time'])
            posts.append(post.attrib)

        return posts
