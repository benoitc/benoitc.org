function Blog(app) {

    function stripScripts(s) {
        return s && s.replace(/<script(.|\n)*?>/g, '');
    };
  
    function safe(s,cap) {
        if (cap && cap < s.length) {
            s = s.substring(0,cap);
            s += '...';
        }
        return s && s.replace(/<(.|\n)*?>/g, '');
    };

    this.formatBody = function(body) {
        var converter = new Showdown.converter();
        return converter.makeHtml(body);
    }

    this.link_for = function(docid) {
        return '<a href="'+app.showPath('post',docid)+'">'+docid+'</a>';
    }

    /* comments */
    function author(author) {
        if (!author) return '';
        if (!author.url) return '<span class="author">par ' + safe(author.name) + '</span>';
        return '<span class="author">par <a href="'+author.url+'">' 
        + safe(author.name) + '</a></span>';      
    };

    function gravatar(c) {
        if (!c.commenter.email) return '';
        return '<img class="gravatar" src="http://www.gravatar.com/avatar/'+c.commenter.gravatar+'.jpg?s=40&d=identicon"/>';
    };

    this.commentListing = function(c) {
        var date = new Date().setRFC3339(c.created_at);
        var date_html = new Date().setRFC3339(c.created_at).toLocaleString();
        if (date.getTime) {
            date_html = date.strftime("%A %d %B %Y, %H h %M");
        }    
        var date_title =  date.toUTCString();

        return '<li><div class="body">'
            +'<p>'+ stripScripts(c.html)
            + '</p>'
            + '</div>'
            +'<p class="comment-meta">'
            + gravatar(c)
            + author(c.commenter) + ', '
            + '<time title="GMT" datetime="'+c.created_at
            + '" title="'+date_title+'" class="caps">'+date_html+ '</p>'
            + '</li>';
  };
}

