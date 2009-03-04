function(doc, req) {  
  // !json lib.templates.edit
  // !json blog
  // !code lib/helpers/ejs/*
  // !code lib/helpers/template.js
  // !code vendor/couchapp/date.js
  // !code vendor/couchapp/path.js

  // we only show html
  //

  return template(lib.templates.edit, {
    doc : doc,
    docid : toJSON((doc && doc._id) || null), 
    assets : assetPath(),
    index : listPath('index','recent-posts',{descending:true,limit:8})
    });
}
