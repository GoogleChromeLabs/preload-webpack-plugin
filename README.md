preload-webpack-plugin
============

A Webpack plugin for automatically wiring up asynchronous (and other types) of JavaScript
chunks using `<link rel='preload'>`. This helps with lazy-loading.

Note: This is an extension plugin for [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) - a plugin that 
simplifies the creation of HTML files to serve your webpack bundles.

This plugin is a stop-gap until we add support for asynchronous chunk wiring to 
[script-ext-html-webpack-plugin](https://github.com/numical/script-ext-html-webpack-plugin/pull/9).

Introduction
------------

[Preload](https://w3c.github.io/preload/) is a web standard aimed at improving performance 
and granular loading of resources. It is a declarative fetch that can tell a browser to start fetching a
source because a developer knows the resource will be needed soon. [Preload: What is it good for?](https://www.smashingmagazine.com/2016/02/preload-what-is-it-good-for/)
is a recommended read if you haven't used the feature before.

In simple web apps, it's straight-forward to specify static paths to scripts you
would like to preload - especially if their names or locations are unlikely to change. In more complex apps, 
JavaScript can be split into "chunks" (that represent routes or components) at with dynamic 
names. These names can include hashes, numbers and other properties that can change with each build.

For example, `chunk.31132ae6680e598f8879.js`.

To make it easier to wire up async chunks for lazy-loading, this plugin offers a drop-in way to wire them up 
using `<link rel='preload'>`.

Pre-requisites
--------------
This module requires Node 4.0.0 and onwards in order to function.

Installation
---------------

First, install the package as a dependency in your package.json:

```js
$ npm install --save-dev preload-webpack-plugin
```

Alternatively, using yarn:

```js
yarn add --d preload-webpack-plugin
```

Usage
-----------------

Next, in your Webpack config, `require()` the preload plugin as follows:

```js
const PreloadWebpackPlugin = require('preload-webpack-plugin');
```

and finally, configure the plugin in your Webpack `plugins` array after `HtmlWebpackPlugin`:

```js
plugins: [
  new HtmlWebpackPlugin(),
  new PreloadWebpackPlugin()
]  
```

By default, the plugin will assume async script chunks will be preloaded with `as=script`.
This is the equivalent of:

```js
plugins: [
  new HtmlWebpackPlugin(),
  new PreloadWebpackPlugin({
    rel: 'preload',
    as: 'script',
    include: 'asyncChunks'
  })
]
```

For a project generating two async scripts with dynamically generated names, such as 
`chunk.31132ae6680e598f8879.js` and `chunk.d15e7fdfc91b34bb78c4.js`, the following preloads
will be injected into the document `<head>`:

```html
<link rel="preload" href="/chunk.31132ae6680e598f8879.js" as="script">
<link rel="preload" href="/chunk.d15e7fdfc91b34bb78c4.js" as="script">
```

You can also configure the plugin to preload all chunks (vendor, async, normal chunks) using
`include`:

```js
plugins: [
  new HtmlWebpackPlugin(),
  new PreloadWebpackPlugin({
    rel: 'preload',
    as: 'script',
    include: 'all'
  })
]
```

Resource Hints
---------------------

Should you wish to use Resource Hints instead of `preload`, this plugin also supports wiring those up.

Prefetch:

```js
plugins: [
  new HtmlWebpackPlugin(),
  new PreloadWebpackPlugin({
    rel: 'prefetch'
  })
]
```

Demo
----------------------

A demo application implementing the PRPL pattern with React that uses this plugin can be found in the `demo`
directory.

Support
-------

If you've found an error in this sample, please file an issue:
[https://github.com/googlechrome/preload-webpack-plugin/issues](https://github.com/googlechrome/preload-webpack-plugin/issues)

Patches are encouraged, and may be submitted by forking this project and
submitting a pull request through GitHub.

Contributing workflow
---------------------

`index.js` contains the primary source for the plugin, `test` contains tests and `demo` contains demo code. 

Test the plugin:

```sh
$ npm install
$ npm run test
```

Lint the plugin:

```sh
$ npm run lint
$ npm run lint-fix # fix linting issues
```

The project is written in ES2015, but does not use a build-step. This may change depending on
any Node version support requests posted to the issue tracker. 

License
-------

Copyright 2017 Google, Inc.

Licensed to the Apache Software Foundation (ASF) under one or more contributor
license agreements.  See the NOTICE file distributed with this work for
additional information regarding copyright ownership.  The ASF licenses this
file to you under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License.  You may obtain a copy of
the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
License for the specific language governing permissions and limitations under
the License.
