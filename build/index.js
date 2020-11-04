"use strict";

/**
 * @license
 * Copyright 2019 Google Inc.
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
const assert = require('assert');

const createHTMLElementString = require('./lib/create-html-element-string');

const defaultOptions = require('./lib/default-options');

const determineAsValue = require('./lib/determine-as-value');

const extractChunks = require('./lib/extract-chunks');

const insertLinksIntoHead = require('./lib/insert-links-into-head');

class PreloadPlugin {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
  }

  addLinks(compilation, htmlPluginData) {
    const options = this.options; // Bail out early if we're configured to exclude this HTML file.

    if (options.excludeHtmlNames.includes(htmlPluginData.plugin.options.filename)) {
      return htmlPluginData;
    }

    const extractedChunks = extractChunks({
      compilation,
      optionsInclude: options.include
    }); // Flatten the list of files.

    const allFiles = extractedChunks.reduce((accumulated, chunk) => {
      return accumulated.concat(chunk.files);
    }, []);
    const uniqueFiles = new Set(allFiles);
    const filteredFiles = [...uniqueFiles].filter(file => {
      return !this.options.fileWhitelist || this.options.fileWhitelist.some(regex => regex.test(file));
    }).filter(file => {
      return !this.options.fileBlacklist || this.options.fileBlacklist.every(regex => !regex.test(file));
    }); // Sort to ensure the output is predictable.

    const sortedFilteredFiles = filteredFiles.sort();
    const links = [];
    const publicPath = compilation.outputOptions.publicPath || '';

    for (const file of sortedFilteredFiles) {
      const href = `${publicPath}${file}`;
      const attributes = {
        href,
        rel: options.rel
      }; // If we're preloading this resource (as opposed to prefetching),
      // then we need to set the 'as' attribute correctly.

      if (options.rel === 'preload') {
        attributes.as = determineAsValue({
          href,
          optionsAs: options.as
        }); // On the off chance that we have an 'href' attribute with a
        // cross-origin URL, set crossOrigin on the <link> to trigger CORS mode.
        // when preloading fonts. (Non-CORS fonts can't be used.)

        if (attributes.as === 'font') {
          attributes.crossorigin = 'anonymous';
        }
      }

      const linkElementString = createHTMLElementString({
        attributes,
        elementName: 'link'
      });
      links.push(linkElementString);
    }

    htmlPluginData.html = insertLinksIntoHead({
      links,
      html: htmlPluginData.html
    });
    return htmlPluginData;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(this.constructor.name, compilation => {
      // This is set in html-webpack-plugin pre-v4.
      let hook = compilation.hooks.htmlWebpackPluginAfterHtmlProcessing;

      if (!hook) {
        const [HtmlWebpackPlugin] = compiler.options.plugins.filter(plugin => plugin.constructor.name === 'HtmlWebpackPlugin');
        assert(HtmlWebpackPlugin, 'Unable to find an instance of ' + 'HtmlWebpackPlugin in the current compilation.');
        hook = HtmlWebpackPlugin.constructor.getHooks(compilation).beforeEmit;
      }

      hook.tapAsync(this.constructor.name, (htmlPluginData, callback) => {
        try {
          callback(null, this.addLinks(compilation, htmlPluginData));
        } catch (error) {
          callback(error);
        }
      });
    });
  }

}

module.exports = PreloadPlugin;