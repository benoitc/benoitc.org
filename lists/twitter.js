function(head, row, req, row_info) {
    // !json lib.templates.twitter
    // !json !code lib.helpers.couchapp
    // !code lib.helpers.ejs.ejs
    // !code lib.helpers.ejs.view
    // !code lib.helpers.template2

    return respondWidth(req, {
        html: function() {
            if (head) {
                return template(lib.templates.index.head, {});
            } else if (row) {
            } else {
                return  template(lib.templates.index.tail, {});
            }
        }
    }
