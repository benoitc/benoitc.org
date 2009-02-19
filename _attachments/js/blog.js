

function f(n) {    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
}
Date.prototype.rfc3339 = function() {
    return this.getUTCFullYear()   + '-' +
         f(this.getUTCMonth() + 1) + '-' +
         f(this.getUTCDate())      + 'T' +
         f(this.getUTCHours())     + ':' +
         f(this.getUTCMinutes())   + ':' +
         f(this.getUTCSeconds())   + 'Z';
};

Date.prototype.setRFC3339 = function(dString){
    var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;

    if (dString.toString().match(new RegExp(regexp))) {
        var d = dString.match(new RegExp(regexp));
        var offset = 0;

        this.setUTCDate(1);
        this.setUTCFullYear(parseInt(d[1],10));
        this.setUTCMonth(parseInt(d[3],10) - 1);
        this.setUTCDate(parseInt(d[5],10));
        this.setUTCHours(parseInt(d[7],10));
        this.setUTCMinutes(parseInt(d[9],10));
        this.setUTCSeconds(parseInt(d[11],10));
        if (d[12])
            this.setUTCMilliseconds(parseFloat(d[12]) * 1000);
        else
            this.setUTCMilliseconds(0);
        if (d[13] != 'Z') {
            offset = (d[15] * 60) + parseInt(d[17],10);
            offset *= ((d[14] == '-') ? -1 : 1);
            this.setTime(this.getTime() - offset * 60 * 1000);
        }
    } else {
        this.setTime(Date.parse(dString));
    }
    return this;
};

/* for now use only one date */
Date.ext.locales['fr'] = {
        a: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
        A: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
        b: ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jui', 'aoû', 'sep', 'oct', 'nov', 'déc'],
        B: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        c: '%a %d %b %Y %T %Z',
        p: ['', ''],
        P: ['', ''],
        x: '%d.%m.%Y',
        X: '%T'
};


function localizeDates() {
  
  var lastdate = '';
  var now = new Date();

  $('time').each(function() {
    var el = $(this);
    if (el.attr('title') == "GMT") {
      var date = new Date().setRFC3339(el.attr('datetime'));
      if (date.getTime()) {

        el.attr('title', date.toUTCString());
        el.html(date.strftime("%A %d %B %Y, %H h %M"));
    }
    }
  });
}


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
        if (!c.commenter.gravatar) return '';
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

