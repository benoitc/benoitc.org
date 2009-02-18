function(head, row, req, row_info) {
  // !json lib.templates.index
  // !json blog
  // !json locales
  // !code lib.helpers.couchapp
  // !code lib.helpers.ejs.ejs
  // !code lib.helpers.ejs.view
  // !code lib.helpers.template2
    
  var indexPath = listPath('index','recent-posts',{descending:true, limit:8});
  var feedPath = listPath('index','recent-posts',{descending:true, limit:8, format:"atom"});
  var archivesPath = listPath('index','archives',{descending:true, limit:25});
  var streamPath = listPath('firehose','stream',{descending:true, limit:25});
  return respondWith(req, {
    html: function() {
        if (head) {
            return template(lib.templates.index.head, {
                assets: assetPath()
            });
        } else if (row) {
            if (req.path[4] == 'recent-posts' && row_info.row_number == 8) {
               return {stop:true};
            }

            var pd, ld = [];
            var day_change = false;
            var month_change = false;

            if (!row_info.first_key) {
                day_change = true;
                month_change = true;
                ld = row.key.split('T');
            } else {
                if (!row_info.prev_key) {
                    pd = row_info.first_key.split('T');
                    ld = row.key.split('T');
                    month_change = true;
                } else {
                    pd = row_info.prev_key.split("T");
                    ld = row.key.split("T");
                }

                if (ld[0] != pd[0]) {
                    day_change = true;
                    if (ld[0].slice(5, 7) != pd[0].slice(5, 7)) {
                        month_change = true;
                    }
                } 
            }

            var month = ld[0].slice(5, 7);
            var lc_month = locales.fr.months[month];
            var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
            return template(lib.templates.index.row, {
                    post: row.value,
                    fcreated_at: fcreated_at,
                    link: showPath('post', row.id),
                    last_day: ld[0],
                    month: lc_month,
                    day: ld[0].slice(8, 10),
                    day_change: day_change,
                    month_change: month_change,
                    row_info: row_info,
                    assets: assetPath(),
                    feedPath: feedPath,
                    streamPath: streamPath
            });
        } else {
            return template(lib.templates.index.tail, {
                archivesPath: archivesPath,
                assets: assetPath()
            });
        }
    },
    atom: function() {
      // with first row in head you can do updated.
      if (head) {
        var f = <feed xmlns="http://www.w3.org/2005/Atom"/>;
        f.title = blog.title;
        f.id = makeAbsolute(req, indexPath);
        f.link.@href = makeAbsolute(req, feedPath);
        f.link.@rel = "self";
        f.generator = 'benoitc.org';
        f.updated = new Date().rfc3339();
        return {body:f.toXMLString().replace(/\<\/feed\>/,'')};
      } else if (row) {
        var entry = <entry/>;
        entry.id = makeAbsolute(req, '/'+encodeURIComponent(req.info.db_name)+'/'+encodeURIComponent(row.id));
        entry.title = row.value.title;
        entry.content = row.value.summary;
        entry.content.@type = 'html';
        entry.updated = row.value.created_at;
        entry.author = <author><name>{row.value.author}</name></author>;
        entry.link.@href = makeAbsolute(req, showPath('post', row.id));
        entry.link.@rel = "alternate";
        return {body:entry};
      } else {
        return {body: "</feed>"};
      }
    }
  })
};
