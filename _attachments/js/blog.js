

function Blog(app) {

    this.formatBody = function(body) {
        var converter = new Showdown.converter();
        return converter.makeHtml(body);
    }
}


