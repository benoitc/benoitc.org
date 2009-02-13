function(doc) {
    if (doc.doc_type == "FeedItem" && doc.service.id == "twitter") {
        
        emit(doc.published, {
                title: doc.title,
                published: doc.published,
                link: doc.link,
                service: doc.service 
        });
    }
}
