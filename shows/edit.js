function(doc, req) {  
  // !json templates.edit
  // !json blog
  // !code vendor/inditeweb/ejs/ejs.js
  // !code vendor/inditeweb/template.js
  // !code vendor/inditeweb/path.js

  if (doc && doc._id) 
    var path_level = "../..";
  else
    var path_level = "..";
    
  return template(templates.edit, {
    doc: (doc || {}),
    docid: toJSON((doc && doc._id) || null), 
    assets: assetPath(),
    author_name: (doc && doc.author || ""),
    path_level: path_level,
    index : listPath('index','recent-posts',{descending:true,limit:8})
  });
}
