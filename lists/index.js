function(head, row, req, row_info) {
  // !json lib.templates.index
  // !json blog
  // !code lib/helpers/ejs/*.js
  // !code lib/helpers/template.js
  // !code vendor/couchapp/date.js
  // !code vendor/couchapp/path.js
    
  var indexPath = listPath('index','recent-posts',{descending:true, limit:8});
  var feedPath = listPath('index','recent-posts',{descending:true, limit:8, format:"atom"});
  var archivesPath = listPath('index','recent-posts',{descending:true, limit:25});
  
  registerType("sitemap", "application/x-xml");
  
  return respondWith(req, {
    html: function() {
        if (head) {
            return template(lib.templates.index.head, {
                assets: assetPath(),
                archivesPath: archivesPath,
                feedPath: feedPath
            });
        } else if (row) {
            if (!req.query.limit && row_info.row_number == 7)
                return {stop: true};
                
            var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
            return template(lib.templates.index.row, {
                    post: row.value,
                    fcreated_at: fcreated_at,
                    link: showPath('post', row.id),
                    assets: assetPath(),
                    feedPath: feedPath
            });
        } else {
            var nextPath = listPath('index','recent-posts', {
                    startkey: ((row_info &&row_info.prev_key) || "#"), 
                    descending:true, 
                    limit:25 });

            return template(lib.templates.index.tail, {
                nextPath: nextPath,
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
        return {body:'<?xml version="1.0" encoding="UTF-8"?>\n'+
                f.toXMLString().replace(/\<\/feed\>/,'')};
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
    },
    sitemap: function() {
      //sitemap
       if (head) {
        return {body:'<?xml version="1.0" encoding="UTF-8"?>\n'+
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>'};
      } else if (row) {
        var url = <url/>;
        url.loc = makeAbsolute(req, showPath('post', row.id));
        url.lastmod = row.value.created_at;
        url.changefreq = "daily";
        url.priority = "0.5";
        return {body:url};
      } else {
        return {body: "</urlset>"};
      }

    }
  })
};
