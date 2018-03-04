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

// This isn't currently transpiled by babel, so manually bring it in.
const flatMap = require('array.prototype.flatmap');
const path = require('path');
const {URL} = require('url');

const createHTMLElementString = require('./lib/create-html-element-string');
const defaultOptions = require('./lib/default-options');
const doesChunkBelongToHTML = require('./lib/does-chunk-belong-to-html');

class PreloadPlugin {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
  }

  apply(compiler) {
    const options = this.options;

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, callback) => {
        const links = [];

        let extractedChunks = [];
        // 'asyncChunks' are chunks intended for lazy/async loading usually generated as
        // part of code-splitting with import() or require.ensure(). By default, asyncChunks
        // get wired up using link rel=preload when using this plugin. This behaviour can be
        // configured to preload all types of chunks or just prefetch chunks as needed.
        if (options.include === undefined || options.include === 'asyncChunks') {
          try {
            extractedChunks = compilation.chunks.filter(chunk => !chunk.isInitial());
          } catch (e) {
            extractedChunks = compilation.chunks;
          }
        } else if (options.include === 'initial') {
          try {
            extractedChunks = compilation.chunks.filter(chunk => chunk.isInitial());
          } catch (e) {
            extractedChunks = compilation.chunks;
          }
        } else if (options.include === 'all') {
          // Async chunks, vendor chunks, normal chunks.
          extractedChunks = compilation.chunks;
        } else if (Array.isArray(options.include)) {
          // Keep only user specified chunks
          extractedChunks = compilation.chunks.filter((chunk) => {
            return chunk.name && options.include.includes(chunk.name);
          });
        } else {
          throw new Error(`The 'include' option isn't set to a recognized value: ${options.include}`);
        }

        const publicPath = compilation.outputOptions.publicPath || '';

        // Only handle the chunk import by the htmlWebpackPlugin
        extractedChunks = extractedChunks
          .filter((chunk) => doesChunkBelongToHTML(chunk, Object.values(htmlPluginData.assets.chunks), {}));

        const uniqueFiles = new Set(flatMap(extractedChunks, chunk => chunk.files));
        const filteredFiles = [...uniqueFiles].filter(
          (file) => this.options.fileBlacklist.every(regex => !regex.test(file)));

        for (const file of filteredFiles) {
          const href = `${publicPath}${file}`;

          const attributes = {
            href,
            rel: options.rel,
          };

          if (options.rel === 'preload') {
            switch (typeof options.as) {
              case 'string': {
                attributes.as = options.as;
                break;
              }

              case 'function': {
                attributes.as = options.as(href);
                break;
              }

              case 'undefined': {
                // If `as` value is not provided in option, dynamically determine the correct
                // value based on the suffix of filename.
                // We only care about the pathname, so just use any domain.
                const url = new URL(href, 'https://example.com');
                const extension = path.extname(url.pathname);

                if (extension === '.css') {
                  attributes.as = 'style';
                } else if (extension === '.woff2') {
                  attributes.as = 'font';
                } else {
                  attributes.as = 'script';
                }

                break;
              }

              default:
                throw new Error(`The 'as' option isn't set to a recognized value: ${options.as}`);
            }

            if (attributes.as === 'font') {
              attributes.crossOrigin = '';
            }
          }

          const linkElementString = createHTMLElementString('link', attributes);
          links.push(linkElementString);
        }

        if (htmlPluginData.html.indexOf('</head>') !== -1) {
          // If a valid closing </head> is found, update it to include preload/prefetch tags
          htmlPluginData.html = htmlPluginData.html.replace('</head>', links.join('\n') + '\n</head>');
        } else {
          // Otherwise assume at least a <body> is present and update it to include a new <head>
          htmlPluginData.html = htmlPluginData.html.replace('<body>', '<head>' + links.join('\n') + '\n</head><body>');
        }

        callback(null, htmlPluginData);
      });
    });
  }
}

module.exports = PreloadPlugin;
