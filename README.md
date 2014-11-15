
node-loaderio
================================
loader.io api wrapper for nodejs

### installation

```sh
$ npm install --save loaderio
```

### API

##### Constructor

```js
var LoaderIO = require('loaderio').LoaderIO;
var api = new LoaderIO('your apikey');
```

##### Apps

```js
api.apps.list(function (err, apps) {
  // list your apps
});

api.apps.create('your name', function (err) {
  // created
});

api.apps.get('your app id', function (err, app) {
  // app result
});

api.apps.del('your app id', function (err) {
  // deleted
});
```

##### Tests

```js
api.tests.list(function (err, tests) {
  // list your tests
  if (tests[0]) {
    tests[0].run();
    tests[0].stop();
  }
});

api.tests.create({
  test_type: 'cycling',
  urls: [],
  duration: 60,
  initial: 0,
  total: 10
});

api.tests.get('your test id', function (err, test) {
  // get specify test object
  test.run();
  test.stop();
});

api.tests.run('your test id');
api.tests.stop('your test id');
```

##### Results

```js
api.results.list('your test id', function (err, results) {
  // list results of your specified test
});

api.result.get('your test id', 'your result id', function (err, result) {
  // result object
});

// or you can access result by tests api
api.tests.get('your test id', function (err, test) {
  test.results.list(function (err, results) {
    // list results of your test object
  });
  test.results.get('your result id', function (err, result) {
    // get result
  });
});
```

### Refs

Loader.io REST API documentation: http://docs.loader.io/api

### License 

MIT Copyright [Yorkie Liu](https://github.com/yorkie)
