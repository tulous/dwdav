# dwdav
> Provide some basic methods for working with DW webdav server

## Installation

```sh
:; npm install bitbucket:demandware/dwdav
```

## Usage

```js
var dwdav = require('dwdav')(config);

dwdav.get().then(function (res) {
	console.log(res);
});
```

## config

Below are the default values for the `config` object.

- `hostname`: `localhost`
- `username`: `admin`
- `password`: `password`
- `version`: `version1`

## API

All methods are promise-based, i.e. they return a promise.

- `get`
- `post`
- `unzip`
- `postAndUnzip`
- `delete`
