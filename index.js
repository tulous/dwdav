'use strict';

var request = require('request');
var parse = require('xml-parser');
var _ = require('lodash');
var fs = require('fs');

function DWDAV (config) {
	this.config = _.extend({
		hostname: 'localhost',
		username: 'admin',
		password: 'password',
		version: 'version1'
	}, config);
}

DWDAV.prototype.getOpts = function () {
	return {
		baseUrl: 'https://' + this.config.hostname + '/on/demandware.servlet/webdav/Sites/Cartridges/' + this.config.version,
		uri: '/',
		auth: {
			user: this.config.username,
			password: this.config.password
		},
		strictSSL: false
	};
};

DWDAV.prototype.get = function () {
	var self = this;
	var req;
	var promise = new Promise(function (resolve, reject) {
		req = request(_.extend(self.getOpts(), {
			headers: {
				Depth: 1
			},
			method: 'PROPFIND'
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			if (res.statusCode >= 400) {
				return reject(new Error(res.statusMessage));
			}
			var response = parse(body);
			// get "response" children
			var responses = _.filter(response.root.children, function (c) {
				return c.name === 'response';
			})
			// get href and display name of each response
			.map(function (res) {
				var href = _.findWhere(res.children, {name: 'href'}).content;
				var prop = _.findWhere(_.findWhere(res.children, {name: 'propstat'}).children, {name: 'prop'});
				var displayname = _.findWhere(prop.children, {name: 'displayname'}).content;
				return {
					href: href,
					name: displayname
				};
			});
			return resolve(responses);
		});
	});
	promise.request = req;
	return promise;
};

DWDAV.prototype.post = function (filePath) {
	var self = this;
	var req;
	var promise = new Promise(function (resolve, reject) {
		req = request(_.extend(self.getOpts(), {
			uri: '/' + filePath,
			method: 'PUT'
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			if (res.statusCode >= 400) {
				return reject(new Error(res.statusMessage));
			}
			resolve(body);
		});
		fs.createReadStream(filePath).pipe(req);
	});
	promise.request = req;
	return promise;
};

DWDAV.prototype.unzip = function (filePath) {
	var self = this;
	var req;
	var promise = new Promise(function (resolve, reject) {
		req = request(_.extend(self.getOpts(), {
			uri: '/' + filePath,
			method: 'POST',
			form: {
				method: 'UNZIP'
			}
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			if (res.statusCode >= 400) {
				return reject(new Error(res.statusMessage));
			}
			resolve(body);
		});
	});
	promise.request = req;
	return promise;
};

DWDAV.prototype.postAndUnzip = function (filePath) {
	var self = this;
	return self.post(filePath)
		.then(function () {
			return self.unzip(filePath);
		});
};

DWDAV.prototype.delete = function (filePath) {
	var self = this;
	var req;
	var promise = new Promise(function (resolve, reject) {
		req = request(_.extend(self.getOpts(), {
			uri: '/' + filePath,
			method: 'DELETE'
		}), function (err, res, body) {
			if (err) {
				return reject(err);
			}
			// it's ok to ignore 404 error if the file is not found
			if (res.statusCode >= 400 && res.statusCode !== 404) {
				return reject(new Error(res.statusMessage));
			}
			resolve(body);
		});
	});
	promise.request = req;
	return promise;
};

module.exports = function (config) {
	return new DWDAV(config);
};
