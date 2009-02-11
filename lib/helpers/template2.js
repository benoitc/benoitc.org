// simple helper to reder template from ejs
//

function template(str, data) {
    return new EJS({text: str}).render(data);
}


