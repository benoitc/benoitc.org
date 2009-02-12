function(doc) {
    if (doc.doc_type == "FeedItem" && (doc.resource && doc.resource == "twitter")) {
        
        url = "http://twitter.com/benoitc/status/" + doc.item.id;
        emit(doc.created_at, {
                text: doc.item.text,
                created_at: doc.item.created_at,
                url: url,
                source: "twitter"
        });
    }
}
