function(doc) {

    if (doc.doc_type == "FeedItem" && (doc.service.id == "twitter" || doc.service.id == "delicious" || doc.service.id == "facebook")) {
        
        emit(doc.published, {
                title: doc.title,
                published: doc.link,
                link: doc.link,
                service: doc.service 
        });
        
    } 
}
