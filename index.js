
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
  this.tests = makeTestsApis(this);
  this.results = makeResultsApis(this);
  this.servers = makeServersApis(this);
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

LoaderIO.prototype.put = function (path, callback) {
  var callback = once(callback);
  https.request({
    method: 'PUT',
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
    get: function (id, callback) {
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

function makeTestsApis (context) {
  return {
    list: function (callback) {
      var self = this;
      var runFn = this.run;
      var stopFn = this.stop;
      context.get('/v2/tests', function (err, list) {
        callback(err, (list || []).map(
          function (item) {
            item = stickResultsApis(item, context);
            item.run = runFn.bind(self, item.test_id);
            item.stop = stopFn.bind(self, item.test_id);
            return item;
          }
        ));
      });
    },
    create: function (test, callback) {
      context.post('/v2/tests', tests, callback);
    },
    get: function (id, callback) {
      var self = this;
      var runFn = this.run;
      var stopFn = this.stop;
      context.get('/v2/tests/' + id, function (err, item) {
        var item = stickResultsApis(item, context);
        item.run = runFn.bind(self, item.test_id);
        item.stop = stopFn.bind(self, item.test_id);
        callback(err, stickResultsApis(item, context));
      });
    },
    run: function (id, callback) {
      context.put('/v2/tests/' + id + '/run', callback);
    },
    stop: function (id, callback) {
      context.put('/v2/tests/' + id + '/stop', callback);
    }
  };
}

function makeResultsApis (context) {
  return {
    list: function (testId, callback) {
      context.get('/v2/tests/' + testId + '/results', callback);
    },
    get: function (testId, resultId, callback) {
      context.get('/v2/tests/' + testId + '/results/' + resultId, callback);
    }
  };
}

function stickResultsApis (test, context) {
  var self = this;
  var results = makeResultsApis(context);
  test.results = Object.keys(results).map(function (key) {
    return results[key].bind(self, test.test_id);
  });
  return test;
}

function makeServersApis (context) {
  return {
    list: function (callback) {
      context.get('/v2/servers', callback);
    }
  };
}

exports.LoaderIO = LoaderIO;

