// this stuff should be properly namespaced etc

// from couch.js
function encodeOptions(options) {
  var buf = []
  if (typeof(options) == "object" && options !== null) {
    for (var name in options) {
      if (!options.hasOwnProperty(name)) continue;
      var value = options[name];
      if (name == "key" || name == "startkey" || name == "endkey") {
        value = toJSON(value);
      }
      buf.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
    }
  }
  if (!buf.length) {
    return "";
  }
  return "?" + buf.join("&");
}

function concatArgs(array, args) {
  for (var i=0; i < args.length; i++) {
    array.push(args[i]);
  };
  return array;
};

function makePath(array) {
  var options, path;
  
  if (typeof array[array.length - 1] != "string") {
    // it's a params hash
    options = array.pop();
    log({options:options});
  }
  path = array.map(function(item) {return encodeURIComponent(item)}).join('/');
  if (options) {
    return path + encodeOptions(options);
  } else {
    return path;    
  }
};

// from prototype
Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

function getEnv() {
    default_env = {
        'dbname': req.path[0],
        'dname': req.path[2]
    };

    new_env = {};
    if (typeof blog != "undefined" && blog.env) {
         for(var host in blog.env) {
             if (host == req.headers.Host) {
                 new_env = blog.env[host];
                 break;
             }
         }
    }
    Object.extend(default_env, new_env);
    return default_env;
};

function assetPath() {
  if (typeof blog != "undefined" && blog.env) {
    for(var host in blog.env) {
        if (host == req.headers.Host && blog.env[host].static_url) {
            parts = ['', blog.env[host].static_url];
            return makePath(concatArgs(parts, arguments));
        }
    }
  }
  parts = ['',req.path[0], '_design', req.path[2]];
  return makePath(concatArgs(parts, arguments));
};

function showPath() {
  if (typeof blog != "undefined" && blog.env) {
    for(var host in blog.env) {
        if (host == req.headers.Host && blog.env[host].show_url) {
            parts = ['', blog.env[host].show_url];
            return makePath(concatArgs(parts, arguments));
        }
    }
  }

  var parts = ['',req.path[0], '_show', req.path[2]];
  return makePath(concatArgs(parts, arguments));
};

function listPath() {
  if (typeof blog != "undefined" && blog.env) {
    for(var host in blog.env) {
        if (host == req.headers.Host && blog.env[host].list_url) {
            parts = ['', blog.env[host].list_url];
            return makePath(concatArgs(parts, arguments));
        }
    }
  }

  var parts = ['',req.path[0], '_list', req.path[2]];
  return makePath(concatArgs(parts, arguments));
};

function makeAbsolute(req, path) {
  return 'http://' + req.headers.Host + path;
}

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

