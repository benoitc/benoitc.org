function(head, row, req, row_info) {
  // !json lib.templates.feeds
  // !code lib.helpers.couchapp
  // !code lib.helpers.ejs.ejs
  // !code lib.helpers.ejs.view
  // !code lib.helpers.template2

    log (row_info);
    return respondWith(req, {
        html: function() {
            
            if (req.query.limit > 50) {
                 throw({"error":"limit can't be bigger than 50"});
            }

            if (head) {
                return template(lib.templates.feeds.head, {
                    assets: assetPath()
                });
            } else if (row) {
                var item = row.value;
                var pd, ld = [];
                var day_change = false;
                
                if (!row_info.first_key) {
                    day_change = true;
                    ld = row.key.split('T');
                } else {
                    if (!row_info.prev_key) {
                        pd = row_info.first_key.split('T');
                        ld = row.key.split('T');
                    } else {
                        pd = row_info.prev_key.split("T");
                        ld = row.key.split("T");
                    }

                    if (ld[0] != pd[0]) {
                        day_change = true;
                    } else if (!pd) {
                        day_change = true;
                    }
                }
                return template(lib.templates.feeds.row, {
                        item: item,
                        last_day: ld[0],
                        day_change: day_change,
                });
            } else {
                return template(lib.templates.feeds.tail, {});
            }
        },
        atom: function() {
              if (head) {
                  var f = <feed xmlns="http://www.w3.org/2005/Atom"/>;
                  f.title = "firehose";
                  f.id = makeAbsolute(req, "/");
                  f.link.@href = makeAbsolute(req, "/");
                  f.link.@rel = "self";
                  f.generator = 'benoitc.org on CouchDB';
                  f.updated = new Date().rfc3339();
                  return {body:f.toXMLString().replace(/\<\/feed\>/,'')};
              } else if (row) {

                  var entry = <entry/>;
                  entry.id = encodeURIComponent(row.id);
                  entry.title = row.value.service.id;
                  entry.content = row.value.title;
                  entry.content.@type = 'html';
                  entry.updated = new Date(row.value.published).rfc3339();
                  entry.author = "<author><name>Benoît Chesneau</name></author>";
                  entry.link.@href = encodeURIComponent(row.value.link);
                  entry.link.@rel = "alternate";
                  return {body:entry};
              } else {
                  return {body : "</feed>"};
              }
        }
    })
};
