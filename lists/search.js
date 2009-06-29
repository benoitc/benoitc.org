function(head, req) {
  // !json templates.search
  // !json blog
  // !json locales
  // !code vendor/inditeweb/path.js
  // !code vendor/inditeweb/date.js
  // !code vendor/inditeweb/ejs/ejs.js
  // !code vendor/inditeweb/template.js
    
  var indexPath = listPath('index','recent-posts',{descending:true, limit:8});
  var feedPath = listPath('search','topics',{descending:true, limit:8, format:"atom"});
  var archivesPath = listPath('index','recent-posts',{descending:true, limit:25});
  return respondWith(req, {
    html: function() {
        send(template(templates.search.head, {
                assets: assetPath(),
                archivesPath: archivesPath,
                feedPath: feedPath
        }));
                
                
        var row, key;
        while (row = getRow()) {
          var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
          send(template(templates.search.row, {
                  post: row.value,
                  fcreated_at: fcreated_at,
                  link: showPath('post', row.id),
                  assets: assetPath()
          }));
        }
        return template(templates.search.tail, {
          archivesPath: archivesPath,
          assets: assetPath()
        });
    },
    atom: function() {
      // with first row in head you can do updated.
      var f = <feed xmlns="http://www.w3.org/2005/Atom"/>;
      f.title = blog.title;
      f.id = makeAbsolute(req, indexPath);
      f.link.@href = makeAbsolute(req, feedPath);
      f.link.@rel = "self";
      f.generator = 'benoitc.org';
      f.updated = new Date().rfc3339();
      send(f.toXMLString().replace(/\<\/feed\>/,''));
      
      while (row = getRow()) {
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
      }
        
      return "</feed>";
    }
  })
};
