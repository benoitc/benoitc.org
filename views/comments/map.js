function(doc) {
  // !code lib.helpers.md5
  if (doc.doc_type == "comment") {
    if (doc.commenter.email) {
        doc.commenter.gravatar = hex_md5(doc.commenter.email);
    } else {
        doc.commenter.gravatar = null;
    }
    emit([doc.post_id, doc.created_at], doc);
  }  
};
