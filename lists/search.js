function(head, row, req, row_info) {
  // !json lib.templates.search
  // !json blog
  // !json locales
  // !code lib.helpers.couchapp
  // !code lib.helpers.ejs.ejs
  // !code lib.helpers.ejs.view
  // !code lib.helpers.template2
    
  var indexPath = listPath('index','recent-posts',{descending:true, limit:8});
  var feedPath = listPath('search','topics',{descending:true, limit:8, format:"atom"});
  var archivesPath = listPath('index','recent-posts',{descending:true, limit:25});
  return respondWith(req, {
    html: function() {
        if (head) {
            return template(lib.templates.search.head, {
                assets: assetPath(),
                archivesPath: archivesPath,
                feedPath: feedPath

            });
        } else if (row) {

            var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
            return template(lib.templates.search.row, {
                    post: row.value,
                    fcreated_at: fcreated_at,
                    link: showPath('post', row.id),
                    assets: assetPath()
            });
        } else {
            return template(lib.templates.search.tail, {
                archivesPath: archivesPath,
                assets: assetPath(),
                env: getEnv()
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
