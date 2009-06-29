function(doc, req) {  
  // !json templates.post
  // !json blog
  // !code vendor/inditeweb/ejs/ejs.js
  // !code vendor/inditeweb/template.js
  // !code vendor/inditeweb/date.js
  // !code vendor/inditeweb/path.js

  var fcreated_at = new Date().setRFC3339(doc.created_at).toLocaleString();
  var indexPath = listPath('index','recent-posts',{descending:true, limit:8, format:"atom"});
  var feedPath = listPath('c','comments',{
    startkey:[doc._id],
    endkey:[doc._id, {}],
    format:"atom", 
    reduce:false,
    title: doc.title
  });

  var labels = [];
  if (doc.labels) {
      for(var i=0; i<doc.labels.length; i++) {
          labels.push('<a href="' +
                  listPath('search','topics',{limit:25, key:doc.labels[i]})
                  + '" rel="tag">'+ doc.labels[i] + '</a>');
      }
  }

  // we only show html
  return template(templates.post, {
    doc: doc,
    fcreated_at: fcreated_at,
    assets : assetPath(),
    editPostPath : showPath('edit', doc._id),
    labels: labels.join(', '),
    index : listPath('index','recent-posts',{descending:true, limit:8}),
    editPath: showPath("edit", doc._id),
    feedPath: feedPath,
    indexPath: indexPath
  });
}
