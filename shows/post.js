function(doc, req) {  
  // !json lib.templates.post
  // !json blog
  // !code lib/helpers/ejs/*
  // !code lib/helpers/template.js
  // !code vendor/couchapp/date.js
  // !code vendor/couchapp/path.js

  var fcreated_at = new Date().setRFC3339(doc.created_at).toLocaleString();

  var labels = [];
  if (doc.labels) {
      for(var i=0; i<doc.labels.length; i++) {
          labels.push('<a href="' +
                  listPath('search','topics',{limit:25, key:doc.labels[i]})
                  + '" rel="tag">'+ doc.labels[i] + '</a>');
      }
  }

  var editPath = showPath("edit", doc._id);
  // we only show html
  return template(lib.templates.post, {
    doc: doc,
    fcreated_at: fcreated_at,
    assets : assetPath(),
    editPostPath : showPath('edit', doc._id),
    labels: labels.join(', '),
    index : listPath('index','recent-posts',{descending:true, limit:8}),
    editPath: editPath
  });
}
