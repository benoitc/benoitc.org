function(doc, req) {  
  // !json lib.templates.post
  // !code lib.helpers.ejs.ejs
  // !code lib.helpers.ejs.view
  // !code lib.helpers.template2
  // !code lib.helpers.couchapp


  // we only show html
  return template(lib.templates.post, {
    doc: doc,
    assets : assetPath(),
    editPostPath : showPath('edit', doc._id),
    index : listPath('index','recent-posts',{descending:true, limit:8})
  });
}
