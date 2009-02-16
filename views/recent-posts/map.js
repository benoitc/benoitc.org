function(doc) {
  // only posts have slugs, dates, and html
  if (doc.doc_type == "post") {
    var summary = (doc.html.replace(/<(.|\n)*?>/g, '').substring(0,350) + '...');
    emit(doc.created_at, {
      summary : summary,
      title : doc.title,
      author : doc.author,
      created_at : doc.created_at
    });    
  }
};
