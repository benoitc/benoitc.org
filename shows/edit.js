function(doc, req) {  
  // !json lib.templates.edit
  // !json blog
  // !code lib.helpers.ejs.ejs
  // !code lib.helpers.ejs.view
  // !code lib.helpers.template2
  // !code lib.helpers.couchapp

  // we only show html
  return template(lib.templates.edit, {
    doc : doc,
    docid : toJSON((doc && doc._id) || null), 
    assets : assetPath(),
    index : listPath('index','recent-posts',{descending:true,limit:8}),
    env: getEnv()
  });
}
