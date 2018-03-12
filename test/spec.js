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

const MemoryFileSystem = require('memory-fs');
const path = require('path');
const {JSDOM} = require('jsdom');

const PreloadPlugin = require('../src/index');

const OUTPUT_DIR = path.join(__dirname, 'dist');

module.exports = ({descriptionPrefix, webpack, HtmlWebpackPlugin}) => {
  describe(`${descriptionPrefix} When passed async chunks, it`, function() {
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
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

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
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

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
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

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


  describe(`${descriptionPrefix} When passed non-async chunks, it`, function() {
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
            include: 'allChunks'
          })
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('rel')).toBe('preload');
        expect(links[0].getAttribute('as')).toBe('script');
        expect(links[0].getAttribute('href')).toBe('/bundle.js');
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
            include: 'allChunks'
          })
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('rel')).toBe('preload');
        expect(links[0].getAttribute('as')).toBe('script');
        expect(links[0].getAttribute('href')).toBe('/bundle.js');
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
            include: 'allChunks'
          })
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('rel')).toBe('preload');
        expect(links[0].getAttribute('as')).toBe('testing');
        expect(links[0].getAttribute('href')).toBe('/bundle.js');
        expect(links[1].getAttribute('rel')).toBe('preload');
        expect(links[1].getAttribute('as')).toBe('testing');
        expect(links[1].getAttribute('href')).toMatch(new RegExp('^/chunk\\.'));

        done();
      });
      compiler.outputFileSystem = new MemoryFileSystem();
    });

    it('should set as="font" and crossOrigin for .woff2 assets', (done) => {
      const compiler = webpack({
        entry: {
          js: path.join(__dirname, 'fixtures', 'file.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: 'bundle.js',
          chunkFilename: 'chunk.[chunkhash].woff2',
          publicPath: '/',
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new PreloadPlugin({
            rel: 'preload',
            include: 'allChunks'
          })
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('rel')).toBe('preload');
        expect(links[0].getAttribute('as')).toBe('script');
        expect(links[0].getAttribute('href')).toBe('/bundle.js');
        expect(links[1].getAttribute('rel')).toBe('preload');
        expect(links[1].getAttribute('as')).toBe('font');
        expect(links[1].hasAttribute('crossorigin')).toBeTruthy();
        expect(links[1].getAttribute('href')).toMatch(new RegExp('^/chunk\\.'));

        done();
      });
      compiler.outputFileSystem = new MemoryFileSystem();
    });

    it('should allow setting the as value via a callback', function(done) {
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
            as: (href) => href.startsWith('/chunk') ? 'test2' : 'test1',
            include: 'allChunks',
          }),
        ],
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('rel')).toBe('preload');
        expect(links[0].getAttribute('as')).toBe('test1');
        expect(links[0].getAttribute('href')).toBe('/bundle.js');
        expect(links[1].getAttribute('rel')).toBe('preload');
        expect(links[1].getAttribute('as')).toBe('test2');
        expect(links[1].getAttribute('href')).toMatch(new RegExp('^/chunk\\.'));

        done();
      });
      compiler.outputFileSystem = new MemoryFileSystem();
    });
  });

  describe(`${descriptionPrefix} When passed normal chunks, it`, function() {
    it('should add prefetch links', function(done) {
      const compiler = webpack({
        entry: path.join(__dirname, 'fixtures', 'file.js'),
        output: {
          path: OUTPUT_DIR
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new PreloadPlugin({
            rel: 'prefetch',
            include: 'allChunks'
          })
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('rel')).toBe('prefetch');
        expect(links[0].hasAttribute('as')).toBeFalsy();
        // There's a difference in the output when run in webpack v3 and v4.
        //   v3 has compilation.chunks[0].files: ['0.js']
        //   v4 has compilation.chunks[0].files: ['home.js']
        expect(['0.js', 'home.js']).toContain(links[0].getAttribute('href'));
        expect(links[1].getAttribute('rel')).toBe('prefetch');
        expect(links[1].hasAttribute('as')).toBeFalsy();
        expect(links[1].getAttribute('href')).toBe('main.js');

        done();
      });
      compiler.outputFileSystem = new MemoryFileSystem();
    });
  });

  describe(`${descriptionPrefix} When using 'include', it`, function() {
    it('should filter based on chunkname', function(done) {
      const compiler = webpack({
        entry: path.join(__dirname, 'fixtures', 'file.js'),
        output: {
          path: OUTPUT_DIR,
          filename: 'bundle.js',
          chunkFilename: '[name].[chunkhash].js',
          publicPath: '/',
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new PreloadPlugin({
            rel: 'preload',
            as: 'script',
            include: ['home']
          })
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(1);
        expect(links[0].getAttribute('rel')).toBe('preload');
        expect(links[0].getAttribute('as')).toBe('script');
        expect(links[0].getAttribute('href')).toMatch(new RegExp('^/home\\.'));

        done();
      });
      compiler.outputFileSystem = new MemoryFileSystem();
    });

    it('should filter based on chunkname, including the sourcemap', function(done) {
      const compiler = webpack({
        entry: path.join(__dirname, 'fixtures', 'file.js'),
        devtool: 'cheap-source-map',
        output: {
          path: OUTPUT_DIR,
          filename: 'bundle.js',
          chunkFilename: '[name].js',
          publicPath: '/',
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new PreloadPlugin({
            rel: 'preload',
            as: 'script',
            include: ['home'],
            // Disable the default file blacklist.
            // This will cause the .map file to be included.
            fileBlacklist: [],
          })
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('rel')).toBe('preload');
        expect(links[0].getAttribute('as')).toBe('script');
        expect(links[0].getAttribute('href')).toBe('/home.js');
        expect(links[1].getAttribute('rel')).toBe('preload');
        expect(links[1].getAttribute('as')).toBe('script');
        expect(links[1].getAttribute('href')).toBe('/home.js.map');

        done();
      });
      compiler.outputFileSystem = new MemoryFileSystem();
    });

    // TODO: Is this testing the right thing? We might need a test around, e.g.,
    // using a different plugin that adds assets without also creating chunks.
    it(`should pull in additional assets when set to 'allAssets'`, function(done) {
      const compiler = webpack({
        // Use "the" as the prefix for the entry names, to ensure that they're
        // sorted after either 0.js or home.js (depending on the webpack version).
        entry: {
          theFirstEntry: path.join(__dirname, 'fixtures', 'file.js'),
          theSecondEntry: path.join(__dirname, 'fixtures', 'vendor.js'),
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js',
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new PreloadPlugin({
            include: 'allAssets',
          }),
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(3);
        expect(links[0].getAttribute('rel')).toBe('preload');
        expect(links[0].getAttribute('as')).toBe('script');
        // There's a difference in the output when run in webpack v3 and v4.
        //   v3 has compilation.chunks[0].files: ['0.js']
        //   v4 has compilation.chunks[0].files: ['home.js']
        expect(['0.js', 'home.js']).toContain(links[0].getAttribute('href'));
        expect(links[1].getAttribute('rel')).toBe('preload');
        expect(links[1].getAttribute('as')).toBe('script');
        expect(links[1].getAttribute('href')).toBe('theFirstEntry.js');
        expect(links[2].getAttribute('rel')).toBe('preload');
        expect(links[2].getAttribute('as')).toBe('script');
        expect(links[2].getAttribute('href')).toBe('theSecondEntry.js');

        done();
      });
      compiler.outputFileSystem = new MemoryFileSystem();
    });
  });

  describe(`${descriptionPrefix} When using an empty config, it`, function() {
    it('should not preload .map files', function(done) {
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
        devtool: 'cheap-source-map',
        plugins: [
          new HtmlWebpackPlugin(),
          new PreloadPlugin()
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

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
  });

  describe(`${descriptionPrefix} When excludeHtmlNames is used,`, function() {
    it(`should not modify the HTML of an asset that's listed`, function(done) {
      const compiler = webpack({
        entry: {
          js: path.join(__dirname, 'fixtures', 'file.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: 'bundle.js',
          chunkFilename: '[name].[chunkhash].js',
          publicPath: '/',
        },
        plugins: [
          new HtmlWebpackPlugin({
            filename: 'ignored.html',
          }),
          new PreloadPlugin({
            excludeHtmlNames: ['ignored.html'],
          })
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const html = result.compilation.assets['ignored.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(0);

        done();
      });
      compiler.outputFileSystem = new MemoryFileSystem();
    });

    it(`should not modify the HTML of an asset that's listed, but modify the HTML of the asset that isn't listed`, function(done) {
      const compiler = webpack({
        entry: {
          js: path.join(__dirname, 'fixtures', 'file.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: 'bundle.js',
          chunkFilename: '[name].[chunkhash].js',
          publicPath: '/',
        },
        plugins: [
          new HtmlWebpackPlugin({
            filename: 'ignored.html',
          }),
          new HtmlWebpackPlugin(),
          new PreloadPlugin({
            excludeHtmlNames: ['ignored.html'],
          })
        ]
      }, function(err, result) {
        expect(err).toBeFalsy(err);
        expect(result.compilation.errors.length).toBe(0,
          result.compilation.errors.join('\n=========\n'));

        const ignoredHtml = result.compilation.assets['ignored.html'].source();
        const ignoredDom = new JSDOM(ignoredHtml);

        const ignoredLinks = ignoredDom.window.document.head.querySelectorAll('link');
        expect(ignoredLinks.length).toBe(0);

        const html = result.compilation.assets['index.html'].source();
        const dom = new JSDOM(html);

        const links = dom.window.document.head.querySelectorAll('link');
        expect(links.length).toBe(1);
        expect(links[0].getAttribute('rel')).toBe('preload');
        expect(links[0].getAttribute('as')).toBe('script');
        expect(links[0].getAttribute('href')).toMatch(new RegExp('^/home\\.'));

        done();
      });
      compiler.outputFileSystem = new MemoryFileSystem();
    });
  });
};
