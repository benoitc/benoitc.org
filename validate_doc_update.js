function (newDoc, oldDoc, userCtx) {
  var doc_type = (oldDoc || newDoc)['doc_type'];
  var author = (oldDoc || newDoc)['author'];
  var docid = (oldDoc || newDoc)['_id'];

  function forbidden(message) {    
    throw({forbidden : message});
  };
  
  function unauthorized(message) {
    throw({unauthorized : message});
  };

  function require(beTrue, message) {
    if (!beTrue) forbidden(message);
  };

  // docs with authors can only be saved by their author
  if (author) {
    // dirty hack to provide userCtx.name to the client process
    if (author == '_self') userCtx.name ? forbidden('_self:' + userCtx.name) : unauthorized('Please log in.');
    
    if (userCtx.roles.indexOf('_admin') == -1) {
      // admin can edit anything, only check when not admin...
      if ((oldDoc && oldDoc.author != newDoc.author))
        forbidden("You may not change the author of a doc.");

      if (author != userCtx.name)
        unauthorized("Only "+author+" may edit this document.");      
    } 
  } else if (docid && docid.startswith('_design/') {
        if (userCtx.roles.indexOf('_admin') == -1) {
            unauthorized('Please log in.');
        }
  }

  // authors and admins can always delete
  if (newDoc._deleted) return true;

  // general timestamps
  if (oldDoc && oldDoc.created_at != newDoc.created_at)
    forbidden("You may not change the created_at field of a doc.");
  
  //if (newDoc.created_at) {
  //  if (!newDoc.created_at.match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} \+0000/))
  //    forbidden("Sorry, "+newDoc.created_at+" is not a valid date format. Try: 2008/12/10 21:16:02 +0000");
  //}
    
  if (doc_type == 'post') {
    // post required fields
    require(author, "Posts must have an author.")
    require(newDoc.body, "Posts must have a body field")
    require(newDoc.html, "Posts must have an html field.");
    require(newDoc.format, "Posts require a format field.");
    require(newDoc.title, "Posts must have a title.");
    require(newDoc.slug, "Posts must have a slug.");
    require(newDoc.slug == newDoc._id, "Post slugs must be used as the _id.")
    require(newDoc.created_at, "Posts must have a created_at date.");

  } else if (doc_type == 'comment') {
    // comment required fields
    require(newDoc.created_at, "Comments must have a created_at date.");
    require(newDoc.post_id, "Comments require a post_id.");
    require(newDoc.html, "Comments require an html body.");
    require(newDoc.comment, "Comments require a comment field.");
    require(newDoc.commenter && newDoc.commenter.name, 'Comments require a name');
    if (newDoc.commenter && newDoc.commenter.url) {
      require(newDoc.commenter.url.match(/^https?:\/\/[^.]*\..*/), "Commenter URL is not valid.");
    }
  }
  return true;
}
