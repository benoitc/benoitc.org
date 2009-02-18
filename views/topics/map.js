function(doc) {
    // only posts have slugs, dates, and html
    if (doc.doc_type == "post" && doc.labels && doc.labels.length) {
        var summary = '';
        if (doc.html.length <= 350) {
            summary = doc.html;
        } else {
            summary = (doc.html.replace(/<(.|\n)*?>/g, '').substring(0,350) + '...');
        }
        for(var idx in doc.labels) {
            emit(doc.labels[idx], {
                summary : summary,
                title : doc.title,
                author : doc.author,
                created_at : doc.created_at
            }); 
        }
    }
};
