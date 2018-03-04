/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MemoryFileSystem = require('memory-fs');
const path = require('path');
const webpack = require('webpack');
const {JSDOM} = require('jsdom');

const PreloadPlugin = require('../src/index');

const OUTPUT_DIR = path.join(__dirname, 'dist');

describe('When passed async chunks, it', function() {
  it('should add preload tags', function(done) {
    const compiler = webpack({
      entry: {
        js: path.join(__dirname, 'fixtures', 'file.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].js',
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin()
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(result.compilation.errors.length).toBe(0);

      const html = result.compilation.assets['index.html'].source();
      const dom = new JSDOM(html);

      const links = dom.window.document.head.querySelectorAll('link');
      expect(links.length).toBe(1);
      expect(links[0].getAttribute('rel')).toBe('preload');
      expect(links[0].getAttribute('as')).toBe('script');
      expect(links[0].getAttribute('href')).toMatch(new RegExp('^/chunk\\.'));

      done();
    });

    compiler.outputFileSystem = new MemoryFileSystem();
  });

  it('should add prefetch tags', function(done) {
    const compiler = webpack({
      entry: {
        js: path.join(__dirname, 'fixtures', 'file.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].js',
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin({
          rel: 'prefetch'
        })
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(result.compilation.errors.length).toBe(0);

      const html = result.compilation.assets['index.html'].source();
      const dom = new JSDOM(html);

      const links = dom.window.document.head.querySelectorAll('link');
      expect(links.length).toBe(1);
      expect(links[0].getAttribute('rel')).toBe('prefetch');
      expect(links[0].getAttribute('href')).toMatch(new RegExp('^/chunk\\.'));

      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });

  it('should respect publicPath', function(done) {
    const compiler = webpack({
      entry: {
        js: path.join(__dirname, 'fixtures', 'file.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].js',
        publicPath: 'https://example.com/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin()
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(result.compilation.errors.length).toBe(0);

      const html = result.compilation.assets['index.html'].source();
      const dom = new JSDOM(html);

      const links = dom.window.document.head.querySelectorAll('link');
      expect(links.length).toBe(1);
      expect(links[0].getAttribute('rel')).toBe('preload');
      expect(links[0].getAttribute('href')).toMatch(new RegExp('^https://example\\.com/chunk\\.'));

      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});


describe('When passed non-async chunks, it', function() {
  it('should add preload tags', function(done) {
    const compiler = webpack({
      entry: path.join(__dirname, 'fixtures', 'file.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].js',
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin({
          rel: 'preload',
          as: 'script',
          include: 'all'
        })
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(result.compilation.errors.length).toBe(0);

      const html = result.compilation.assets['index.html'].source();
      const dom = new JSDOM(html);

      const links = dom.window.document.head.querySelectorAll('link');
      expect(links.length).toBe(2);
      expect(links[0].getAttribute('rel')).toBe('preload');
      expect(links[0].getAttribute('as')).toBe('script');
      expect(links[0].getAttribute('href')).toMatch(new RegExp('^/bundle\\.js$'));
      expect(links[1].getAttribute('rel')).toBe('preload');
      expect(links[1].getAttribute('as')).toBe('script');
      expect(links[1].getAttribute('href')).toMatch(new RegExp('^/chunk\\.'));

      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });

  it('should set as="style" for CSS, and as="script" otherwise', function(done) {
    const compiler = webpack({
      entry: {
        js: path.join(__dirname, 'fixtures', 'file.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].css',
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin({
          rel: 'preload',
          include: 'all'
        })
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(result.compilation.errors.length).toBe(0);

      const html = result.compilation.assets['index.html'].source();
      const dom = new JSDOM(html);

      const links = dom.window.document.head.querySelectorAll('link');
      expect(links.length).toBe(2);
      expect(links[0].getAttribute('rel')).toBe('preload');
      expect(links[0].getAttribute('as')).toBe('script');
      expect(links[0].getAttribute('href')).toMatch(new RegExp('^/bundle\\.js$'));
      expect(links[1].getAttribute('rel')).toBe('preload');
      expect(links[1].getAttribute('as')).toBe('style');
      expect(links[1].getAttribute('href')).toMatch(new RegExp('^/chunk\\.'));

      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });


  it('should use the value for the as attribute passed in the configuration', (done) => {
    const compiler = webpack({
      entry: path.join(__dirname, 'fixtures', 'file.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].css',
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin({
          rel: 'preload',
          as: 'testing',
          include: 'all'
        })
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(result.compilation.errors.length).toBe(0);

      const html = result.compilation.assets['index.html'].source();
      const dom = new JSDOM(html);

      const links = dom.window.document.head.querySelectorAll('link');
      expect(links.length).toBe(2);
      expect(links[0].getAttribute('rel')).toBe('preload');
      expect(links[0].getAttribute('as')).toBe('testing');
      expect(links[0].getAttribute('href')).toMatch(new RegExp('^/bundle\\.js$'));
      expect(links[1].getAttribute('rel')).toBe('preload');
      expect(links[1].getAttribute('as')).toBe('testing');
      expect(links[1].getAttribute('href')).toMatch(new RegExp('^/chunk\\.'));

      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

//
//   it('adds preload using "font" for fonts and add crossorigin attribute', (done) => {
//     const compiler = webpack({
//       entry: {
//         js: path.join(__dirname, 'fixtures', 'file.js')
//       },
//       output: {
//         path: OUTPUT_DIR,
//         filename: 'bundle.js',
//         chunkFilename: 'chunk.[chunkhash].woff2',
//         publicPath: '/',
//       },
//       plugins: [
//         new HtmlWebpackPlugin(),
//         new PreloadPlugin({
//           rel: 'preload',
//           include: 'all'
//         })
//       ]
//     }, function(err, result) {
//       expect(err).toBeFalsy();
//       expect(JSON.stringify(result.compilation.errors)).toBe('[]');
//       const html = result.compilation.assets['index.html'].source();
//       expect(html).toContain('<link rel="preload" as="font" crossorigin="crossorigin" href="/chunk');
//       expect(html).toContain('<link rel="preload" as="script" href="/bundle.js"');
//       done();
//     });
//     compiler.outputFileSystem = new MemoryFileSystem();
//   });
//
//   it('use custom as attribute based on return value of callback', (done) => {
//     const compiler = webpack({
//       entry: path.join(__dirname, 'fixtures', 'file.js'),
//       output: {
//         path: OUTPUT_DIR,
//         filename: 'bundle.js',
//         chunkFilename: 'chunk.[chunkhash].css',
//         publicPath: '/',
//       },
//       plugins: [
//         new HtmlWebpackPlugin(),
//         new PreloadPlugin({
//           rel: 'preload',
//           as(entry) {
//             if (entry.indexOf('/chunk') === 0) return 'style';
//             return 'script';
//           },
//           include: 'all',
//         }),
//       ],
//     }, function(err, result) {
//       expect(err).toBeFalsy();
//       expect(JSON.stringify(result.compilation.errors)).toBe('[]');
//       const html = result.compilation.assets['index.html'].source();
//       expect(html).toContain('<link rel="preload" as="style" href="/chunk');
//       expect(html).toContain('<link rel="preload" as="script" href="/bundle.js"');
//       done();
//     });
//     compiler.outputFileSystem = new MemoryFileSystem();
//   });
// });
//
// describe('PreloadPlugin prefetches normal chunks', function() {
//   it('adds prefetch tags', function(done) {
//     const compiler = webpack({
//       entry: path.join(__dirname, 'fixtures', 'file.js'),
//       output: {
//         path: OUTPUT_DIR
//       },
//       plugins: [
//         new HtmlWebpackPlugin(),
//         new PreloadPlugin({
//           rel: 'prefetch',
//           include: 'all'
//         })
//       ]
//     }, function(err, result) {
//       expect(err).toBeFalsy();
//       expect(JSON.stringify(result.compilation.errors)).toBe('[]');
//       const html = result.compilation.assets['index.html'].source();
//       expect(html).toContain('<link rel="prefetch" href="0');
//       expect(html).toContain('<link rel="prefetch" href="main.js"');
//       done();
//     });
//     compiler.outputFileSystem = new MemoryFileSystem();
//   });
// });
//
// describe('PreloadPlugin filters chunks', function() {
//   it('based on chunkname', function(done) {
//     const compiler = webpack({
//       entry: path.join(__dirname, 'fixtures', 'file.js'),
//       output: {
//         path: OUTPUT_DIR,
//         filename: 'bundle.js',
//         chunkFilename: '[name].[chunkhash].js',
//         publicPath: '/',
//       },
//       plugins: [
//         new HtmlWebpackPlugin(),
//         new PreloadPlugin({
//           rel: 'preload',
//           as: 'script',
//           include: ['home']
//         })
//       ]
//     }, function(err, result) {
//       expect(err).toBeFalsy();
//       expect(JSON.stringify(result.compilation.errors)).toBe('[]');
//       const html = result.compilation.assets['index.html'].source();
//       expect(html).toContain('<link rel="preload" as="script" href="/home');
//       expect(html).not.toContain('<link rel="preload" as="script" href="/bundle.js"');
//       done();
//     });
//     compiler.outputFileSystem = new MemoryFileSystem();
//   });
//   it('based on chunkname with sourcemap', function(done) {
//     const compiler = webpack({
//       entry: path.join(__dirname, 'fixtures', 'file.js'),
//       devtool: 'cheap-source-map',
//       output: {
//         path: OUTPUT_DIR,
//         filename: 'bundle.js',
//         chunkFilename: '[name].js',
//         publicPath: '/',
//       },
//       plugins: [
//         new HtmlWebpackPlugin(),
//         new PreloadPlugin({
//           rel: 'preload',
//           as: 'script',
//           include: ['home'],
//           // disable default file blacklist, to include map file
//           fileBlacklist: [],
//         })
//       ]
//     }, function(err, result) {
//       expect(err).toBeFalsy();
//       expect(JSON.stringify(result.compilation.errors)).toBe('[]');
//       const html = result.compilation.assets['index.html'].source();
//       expect(html).toContain('<link rel="preload" as="script" href="/home.js');
//       expect(html).toContain('<link rel="preload" as="script" href="/home.js.map');
//       expect(html).not.toContain('<link rel="preload" as="script" href="/bundle.js"');
//       done();
//     });
//     compiler.outputFileSystem = new MemoryFileSystem();
//   });
// });
//
// describe('filtering unwanted files', function() {
//   it('does not include map files to be preloaded', function(done) {
//     const compiler = webpack({
//       entry: {
//         js: path.join(__dirname, 'fixtures', 'file.js')
//       },
//       output: {
//         path: OUTPUT_DIR,
//         filename: 'bundle.js',
//         chunkFilename: 'chunk.[chunkhash].js',
//         publicPath: '/',
//       },
//       devtool: 'cheap-source-map',
//       plugins: [
//         new HtmlWebpackPlugin(),
//         new PreloadPlugin()
//       ]
//     }, function(err, result) {
//       expect(err).toBeFalsy();
//       expect(JSON.stringify(result.compilation.errors)).toBe('[]');
//       const html = result.compilation.assets['index.html'].source();
//       expect(html).toContain('<link rel="preload" as="script" href="/chunk.');
//       expect(html).not.toContain('.map"');
//       done();
//     });
//     compiler.outputFileSystem = new MemoryFileSystem();
//   });
// });
