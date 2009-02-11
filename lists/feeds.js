function(head, row, req, row_info) {
  // !json lib.templates.feeds
  // !code lib.helpers.couchapp
  // !code lib.helpers.template

    return respondWith(req, {
        html: function() {
            if (head) {
                return template(lib.templates.feeds.head, {});
            } else if (row) {
                return '';
            } else {
                return template(lib.templates.feeds.tail, {});
            }
        }
    })
};
