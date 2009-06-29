function(head, req) {
  // !json templates.index
  // !json blog
  // !code vendor/inditeweb/path.js
  // !code vendor/inditeweb/date.js
  // !code vendor/inditeweb/ejs/ejs.js
  // !code vendor/inditeweb/template.js
    
  log(req.query)
  var current_path = "/" + currentPath();
  var previous= false;
  var indexPath = listPath('index','recent-posts',{descending:true, limit:8});
  var feedPath = listPath('index','recent-posts',{descending:true, limit:8, format:"atom"});
  var archivesPath = listPath('index','recent-posts',{descending:true, limit:25});
  
  
  return respondWith(req, {
    html: function() {
        send(template(templates.index.head, {
                assets: assetPath(),
                archivesPath: archivesPath,
                feedPath: feedPath
        }));
                         
        var row, key,
            i = 0,
            cls="";
        while (row = getRow()) {
          if (!req.query.limit && i >= 7)
              break;
          var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
          
          send(template(templates.index.row, {
                  post: row.value,
                  fcreated_at: fcreated_at,
                  link: showPath('post', row.id),
                  assets: assetPath(),
                  cls: cls,
                  

          }));
          i = i + 1;
          key = row.key;
          if (cls)
            cls = "";
          else
            cls = " aright";
        }
        
        var nextPath = "";
        var to_display = head.total_rows - head.offset - i - 1;
        if (to_display > 0)
          nextPath = olderPath(key) + "&back="+current_path;
          
        if (req.query['back'])
          previous = req.query['back'];
          
        return template(templates.index.tail, {
          archivesPath: archivesPath,
          assets: assetPath(),
          nextPath: nextPath,
          currentPath: current_path,
          previous: previous
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
        send(entry);
      }
        
      return "</feed>";
    },
    sitemap: function() {
      //sitemap
      send('<?xml version="1.0" encoding="UTF-8"?>\n'+
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
      
      while (row = getRow()) {
        var url = <url/>;
        url.loc = makeAbsolute(req, showPath('post', row.id));
        url.lastmod = row.value.created_at;
        url.changefreq = "daily";
        url.priority = "0.5";
        send (url);
      }
      return "</urlset>";

    }
  });
};
