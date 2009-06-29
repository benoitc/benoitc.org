function(head, req) {
  // !json templates.index
  // !json blog// 
  // !code vendor/inditeweb/json2.js
  // !code vendor/inditeweb/path.js
  // !code vendor/inditeweb/date.js
  // !code vendor/inditeweb/ejs/ejs.js
  // !code vendor/inditeweb/template.js
    
  var current_path = "/" + currentPath();
  var previous= false;
  var indexPath = showPath('post', req.query.startkey[0]);
  var feedPath = currentPath();
  
  
  var title = "Commententaires sur " + req.query.title || blog.title;
  
  return respondWith(req, {
    
    atom: function() {
      // with first row in head you can do updated.
      var f = <feed xmlns="http://www.w3.org/2005/Atom"/>;
      f.title = title;
      f.id = makeAbsolute(req, indexPath);
      f.link.@href = makeAbsolute(req, feedPath);
      f.link.@rel = "self";
      f.generator = 'benoitc.org';
      f.updated = new Date().rfc3339();
      send(f.toXMLString().replace(/\<\/feed\>/,''));
      
      while (row = getRow()) {
        log(["row value",row]);
        var entry = <entry/>;
        entry.id = makeAbsolute(req, '/'+encodeURIComponent(req.info.db_name)+'/'+encodeURIComponent(row.id));
        
        var authorname = "anonymous";
        if (row.value.commenter && row.value.commenter["name"]) {
          authorname = row.value.commenter["name"];
        }
        
        entry.title = "by " + authorname + " on " + ( req.query.title || row.key[0]);
        entry.content = row.value.html;
        entry.content.@type = 'html';
        entry.updated = row.value.created_at;
        entry.author = <author><name>{authorname}</name></author>;
        entry.link.@href = makeAbsolute(req, showPath('post', row.key[0]));
        entry.link.@rel = "alternate";
        send(entry);
      }
        
      return "</feed>";
    }
  });
};
