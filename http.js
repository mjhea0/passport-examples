/**
 * Modified version of TJ's http support file from the Express repo:
 * https://github.com/visionmedia/express/blob/master/test/support/http.js
 *
 * Module dependencies.
 */
 
var EventEmitter = require('events').EventEmitter
  , should = require('should')
  , methods = ['get','post','put','delete','head']
  , http = require('http')
  
  , server
  , addr;
 
exports.createServer = function(app,fn){
  if(server){ return fn(); }
 
  server = app;
  server.listen(0, function(){
    addr = 1338;
    fn();
  });
 
}
 
exports.request = function() {
  return new Request();
}
 
function Request() {
  var self = this;
  this.data = [];
  this.header = {};
}
 
/**
 * Inherit from `EventEmitter.prototype`.
 */
 
Request.prototype.__proto__ = EventEmitter.prototype;
 
methods.forEach(function(method){
  Request.prototype[method] = function(path){
    return this.request(method, path);
  };
});
 
Request.prototype.set = function(field, val){
  this.header[field] = val;
  return this;
};
 
Request.prototype.write = function(data){
  this.data.push(data);
  return this;
};
 
Request.prototype.request = function(method, path){
  this.method = method;
  this.path = path;
  return this;
};
 
Request.prototype.expect = function(body, fn){
  this.end(function(res){
    if ('number' == typeof body) {
      res.statusCode.should.equal(body);
    } else if (body instanceof RegExp) {
      res.body.should.match(body);
    } else {
      res.body.should.equal(body);
    }
    fn();
  });
};
 
Request.prototype.end = function(fn){
 
  var req = http.request({
      method: this.method
    , port: addr.port
    , host: addr.address
    , path: this.path
    , headers: this.header
  });
 
  this.data.forEach(function(chunk){
    req.write(chunk);
  });
  
  req.on('response', function(res){
    var buf = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){ buf += chunk });
    res.on('end', function(){
      res.body = buf;
      fn(res);
    });
  });
 
  req.end();
 
  return this;
};