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

const createHTMLElementString = require('./lib/create-html-element-string');
const defaultOptions = require('./lib/default-options');
const determineAsValue = require('./lib/determine-as-value');
const doesChunkBelongToHTML = require('./lib/does-chunk-belong-to-html');
const extractChunks = require('./lib/extract-chunks');
const insertLinksIntoHead = require('./lib/insert-links-into-head');

class PreloadPlugin {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
  }

  addLinks(compilation, htmlPluginData) {
    const options = this.options;

    const extractedChunks = extractChunks(compilation, options.include);

    const publicPath = compilation.outputOptions.publicPath || '';

    // Only handle chunks imported by this HtmlWebpackPlugin.
    const htmlChunks = extractedChunks.filter(
      (chunk) => doesChunkBelongToHTML(chunk, Object.values(htmlPluginData.assets.chunks), {}));

    const allFiles = htmlChunks.reduce((accumulated, chunk) => {
      return accumulated.concat(chunk.files);
    }, []);
    const uniqueFiles = new Set(allFiles);
    const filteredFiles = [...uniqueFiles].filter(
      (file) => this.options.fileBlacklist.every(regex => !regex.test(file)));
    const sortedFilteredFiles = filteredFiles.sort();

    const links = [];
    for (const file of sortedFilteredFiles) {
      const href = `${publicPath}${file}`;

      const attributes = {
        href,
        rel: options.rel,
      };

      // If we're preloading this resource (as opposed to prefetching),
      // then we need to set the 'as' attribute correctly.
      if (options.rel === 'preload') {
        attributes.as = determineAsValue(options.as, href);

        // On the off chance that we have a cross-origin 'href' attribute,
        // set crossOrigin on the <link> to trigger CORS mode. Non-CORS
        // fonts can't be used.
        if (attributes.as === 'font') {
          attributes.crossorigin = '';
        }
      }

      const linkElementString = createHTMLElementString('link', attributes);
      links.push(linkElementString);
    }

    htmlPluginData.html = insertLinksIntoHead(htmlPluginData.html, links);

    return htmlPluginData;
  }

  apply(compiler) {
    if ('hooks' in compiler) {
      compiler.hooks.compilation.tap(
        this.constructor.name,
        compilation => {
          compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(
            this.constructor.name,
            (htmlPluginData, callback) => {
              try {
                callback(null, this.addLinks(compilation, htmlPluginData));
              } catch (error) {
                callback(error);
              }
            }
          );
        }
      );
    } else {
      compiler.plugin('compilation', (compilation) => {
        compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, callback) => {
          try {
            callback(null, this.addLinks(compilation, htmlPluginData));
          } catch (error) {
            callback(error);
          }
        });
      });
    }
  }
}

module.exports = PreloadPlugin;