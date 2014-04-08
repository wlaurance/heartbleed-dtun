var request = require('request')
var async = require('async')
var _ = require('underscore')
var url = require('url')


function getDTUNHits(cb) {
  request("http://dotheyusenode.herokuapp.com/counts", {json:true}, function(e,r,b) {
    if (e) {
      throw e;
    } else {
      cb(null, b);
    }
  })
}

function makeHeartBleedTest(url, cb) {
  request("http://bleed-1161785939.us-east-1.elb.amazonaws.com/bleed/" + url, {json:true}, function(e,r,b) {
    if (b && b.code === 0) {
      console.log(url + " is vulnerable to heartbleed attack")
    }
    cb()
  });
}

getDTUNHits(function(err, hits) {

  var httpsOnly = _.filter(hits, function(h) {
    return h.url.indexOf('https') !== -1
  });

  var urlOnly = _.map(hits, function(h) {
    return url.parse(h.url);
  });

  var hostPortOnly = _.map(urlOnly, function(h) {
    var url = h.hostname;
    if (h.port) {
      url += ":" + h.port
    } else {
      url += ":" + 443
    }
    return url;
  });

  async.each(hostPortOnly, makeHeartBleedTest)
});



