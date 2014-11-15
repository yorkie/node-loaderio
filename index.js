
var https = require('https');
var once = require('once');
var es = require('event-stream');
var host = 'api.loader.io';

function LoaderIO (apikey) {
  if (!(this instanceof LoaderIO))
    return new LoaderIO(apikey);
  if (!apikey)
    throw new Error('apikey required');

  this.headers = {
    'loaderio-auth': apikey,
    'content-type': 'application/json; charset=UTF-8'
  };
  this.apps = makeAppsApis(this);
}

function resolveResp (res, callback) {
  res.pipe(
    es.wait(function (err, data) {
      if (err)
        return callback(err);
      try {
        var body = JSON.parse(data);
      }
      catch (e) {
        return callback(e);
      }
      if (body.message && body.message === 'error')
        return callback(new Error(body.errors[0]));
      else
        return callback(null, body);
    })
  );
}

LoaderIO.prototype.get = function (path, callback) {
  var callback = once(callback);
  https.request({
    method: 'GET',
    hostname: host,
    path: path,
    headers: this.headers
  }, function (res) {
    resolveResp(res, callback);
  }).once('error', callback).end();
};

LoaderIO.prototype.del = function (path, callback) {
  var callback = once(callback);
  https.request({
    method: 'DELETE',
    hostname: host,
    path: path,
    headers: this.headers
  }, function (res) {
    resolveResp(res, callback);
  }).once('error', callback).end();
};

LoaderIO.prototype.post = function (path, body, callback) {
  var callback = once(callback);
  https.request({
    method: 'POST',
    hostname: host,
    path: path,
    headers: this.headers
  }, function (res) {
    resolveResp(res, callback);
  })
  .once('error', callback)
  .write(JSON.stringify(body))
  .end();
};

function makeAppsApis (context) {
  return {
    list: function (callback) {
      context.get('/v2/apps', callback);
    },
    create: function (app, callback) {
      context.post('/v2/apps', {app: app}, callback);
    },
    select: function (id, callback) {
      context.get('/v2/apps/' + id, callback);
    },
    verify: function (method, callback) {
      context.post('/v2/apps/' + id + '/verify', {method: method}, callback);
    },
    delete: function (id, callback) {
      context.del('/v2/apps/' + id, callback);
    }
  };
}
