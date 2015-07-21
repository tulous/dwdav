'use strict';

var config = {
	hostname: 'dev10-sitegenesis-dw.demandware.net',
	password: 'Demandware1!'
};

var filename = 'test.js';
var webdavPath = '/on/demandware.servlet/webdav/Sites/Cartridges/';
var version = 'version1';

var dwdav = require('./')(config);

var tap = require('tap');
tap.test('get', function (t) {
	var req = dwdav.get().request;
	t.equal(req.method, 'PROPFIND');
	t.equal(req.headers.Depth, 1);
	t.match(req.headers.authorization, /^Basic.*$/);
	t.equal(req.uri.host, config.hostname);
	t.notOk(req.strictSSL);
	t.end();
});

tap.test('post', function (t) {
	var req = dwdav.post(filename).request;
	t.equal(req.method, 'PUT');
	t.match(req.headers.authorization, /^Basic.*$/);
	t.equal(req.uri.host, config.hostname);
	t.notOk(req.strictSSL);
	t.equal(req.path, webdavPath + version + '/' + filename);
	t.end();
});

tap.test('unzip', function (t) {
	var req = dwdav.unzip(filename).request;
	t.equal(req.method, 'POST');
	t.match(req.headers.authorization, /^Basic.*$/);
	t.equal(req.headers['content-type'], 'application/x-www-form-urlencoded');
	t.equal(req.uri.host, config.hostname);
	t.notOk(req.strictSSL);
	t.equal(req.path, webdavPath + version + '/' + filename);
	t.end();
});

tap.test('delete', function (t) {
	var req = dwdav.delete(filename).request;
	t.equal(req.method, 'DELETE');
	t.match(req.headers.authorization, /^Basic.*$/);
	t.equal(req.uri.host, config.hostname);
	t.notOk(req.strictSSL);
	t.equal(req.path, webdavPath + version + '/' + filename);
	t.end();
});
