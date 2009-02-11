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

from xml.etree import ElementTree as ET

from simplecouchdb import Server
from simplecouchdb.schema import *

from resources.delicious import DeliciousResource

server = Server()
db = server.create_session('benoitc')

delicious = DeliciousResource('bchesneau', 'as61zx')

class FeedItem(Document):
    resource = StringProperty()
    created_at = DateTimeProperty()
    fetched = DateTimeProperty()
    item = DictProperty()

FeedItem = db(FeedItem)


def main():
    posts = delicious.get_all()
    print posts[0]

if __name__ == '__main__':
    main()

