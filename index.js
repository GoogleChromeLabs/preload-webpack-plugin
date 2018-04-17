/**
 * @license
 * Copyright 2017 Google Inc.
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
'use strict';

// See https://github.com/GoogleChromeLabs/preload-webpack-plugin/issues/45
require('object.values').shim();

const objectAssign = require('object-assign');

const PLUGIN_NAME = 'preload-webpack-plugin';

const weblog = require('webpack-log');
const log = weblog({name: PLUGIN_NAME});

const flatten = arr => arr.reduce((prev, curr) => prev.concat(curr), []);

const doesChunkBelongToHTML = (chunk, roots, visitedChunks) => {
  // Prevent circular recursion.
  // See https://github.com/GoogleChromeLabs/preload-webpack-plugin/issues/49
  if (visitedChunks[chunk.renderedHash]) {
    return false;
  }
  visitedChunks[chunk.renderedHash] = true;

  for (const root of roots) {
    if (root.hash === chunk.renderedHash) {
      return true;
    }
  }

  for (const parent of chunk.parents) {
    if (doesChunkBelongToHTML(parent, roots, visitedChunks)) {
      return true;
    }
  }

  return false;
};

const doesChunkGroupBelongToHTML = (chunkGroup, rootChunkGroups, visitedChunks) => {
  // Prevent circular recursion.
  // See https://github.com/GoogleChromeLabs/preload-webpack-plugin/issues/49
  if (visitedChunks[chunkGroup.groupDebugId]) {
    return false;
  }
  visitedChunks[chunkGroup.groupDebugId] = true;

  for (const rootChunkGroup of rootChunkGroups) {
    if (rootChunkGroup.groupDebugId === chunkGroup.groupDebugId) {
      return true;
    }
  }

  for (const parentChunkGroup of chunkGroup.getParents()) {
    if (doesChunkGroupBelongToHTML(parentChunkGroup, rootChunkGroups, visitedChunks)) {
      return true;
    }
  }

  return false;
};

const defaultOptions = {
  rel: 'preload',
  include: 'asyncChunks',
  fileBlacklist: [/\.map/],
  excludeHtmlNames: [],
};

class PreloadPlugin {
  constructor(options) {
    this.options = objectAssign({}, defaultOptions, options);
  }

  apply(compiler) {
    this.beforeV4 = !compiler.hooks;
    if (this.beforeV4) {
      compiler.plugin('compilation', this.pluginHandler.bind(this));
    } else {
      compiler.hooks['compilation'].tap(PLUGIN_NAME, this.hooksHandler.bind(this));
    }
  }

  // handler use for webpack v4
  hooksHandler(compilation) {
    if (!compilation.hooks.htmlWebpackPluginAfterHtmlProcessing) {
      const message = `compilation.hooks.htmlWebpackPluginAfterHtmlProcessing is lost.
      Please make sure you have installed html-webpack-plugin and put it before ${PLUGIN_NAME}`;
      log.error(message);
      throw new Error(message);
    }
    compilation.hooks.htmlWebpackPluginAfterHtmlProcessing
      .tapAsync(PLUGIN_NAME, (htmlPluginData, cb) => this.afterHtmlProcessingFn(htmlPluginData, cb, compilation));
  }

  // handler use before webpack v4
  pluginHandler(compilation) {
    compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, cb) => {
      this.afterHtmlProcessingFn(htmlPluginData, cb, compilation);
    });
  }

  afterHtmlProcessingFn(htmlPluginData, cb, compilation) {
    if (this.options.excludeHtmlNames.indexOf(htmlPluginData.plugin.options.filename) > -1) {
      cb(null, htmlPluginData);
      return;
    }

    const extractedChunks = this.beforeV4
      ? this.extractedChunksByChunk(htmlPluginData, compilation)
      : this.extractedChunksByChunkGroup(htmlPluginData, compilation);

    this.addLinksBasedOnChunks(extractedChunks, compilation, htmlPluginData, cb);
  }

  extractedChunksByChunkGroup(htmlPluginData, compilation) {
    const options = this.options;
    let extractedChunks = [];
    const initialChunkGroups = compilation.chunkGroups.filter(chunkGroup => chunkGroup.isInitial());
    const initialChunks = initialChunkGroups.reduce((initialChunks, {chunks}) => {
      return initialChunks.concat(chunks);
    }, []);
    // 'asyncChunks' are chunks intended for lazy/async loading usually generated as
    // part of code-splitting with import() or require.ensure(). By default, asyncChunks
    // get wired up using link rel=preload when using this plugin. This behaviour can be
    // configured to preload all types of chunks or just prefetch chunks as needed.
    if (options.include === undefined || options.include === 'asyncChunks') {
      extractedChunks = compilation.chunks.filter(chunk => {
        return initialChunks.indexOf(chunk) < 0;
      });
    } else if (options.include === 'initial') {
      extractedChunks = compilation.chunks.filter(chunk => {
        return initialChunks.indexOf(chunk) > -1;
      });
    } else if (options.include === 'allChunks' || options.include === 'all') {
      if (options.include === 'all') {
        /* eslint-disable no-console */
        console.warn('[WARNING]: { include: "all" } is deprecated, please use "allChunks" instead.');
        /* eslint-enable no-console */
      }
      // Async chunks, vendor chunks, normal chunks.
      extractedChunks = compilation.chunks;
    } else if (options.include === 'allAssets') {
      extractedChunks = [{files: Object.keys(compilation.assets)}];
    } else if (Array.isArray(options.include)) {
      // Keep only user specified chunks
      extractedChunks = compilation.chunks
        .filter((chunk) => {
          const chunkName = chunk.name;
          // Works only for named chunks
          if (!chunkName) {
            return false;
          }
          return options.include.indexOf(chunkName) > -1;
        });
    }

    // only handle the chunks associated to this htmlWebpackPlugin instance, in case of multiple html plugin outputs
    // allow `allAssets` mode to skip, as assets are just files to be filtered by black/whitelist, not real chunks
    if (options.include !== 'allAssets') {
      extractedChunks = extractedChunks.filter(chunk => {
        const rootChunksHashs = Object.values(htmlPluginData.assets.chunks).map(({hash}) => hash);
        const rootChunkGroups = compilation.chunkGroups.reduce((groups, chunkGroup) => {
          const isRootChunkGroup = chunkGroup.chunks.reduce((flag, chunk) => {
            return flag ||
              rootChunksHashs.indexOf(chunk.renderedHash) > -1;
          }, false);
          if (isRootChunkGroup) groups.push(chunkGroup);
          return groups;
        }, []);
        return Array.from(chunk.groupsIterable).reduce((flag, chunkGroup) => {
          return flag ||
            doesChunkGroupBelongToHTML(chunkGroup, rootChunkGroups, {});
        }, false);
      });
    }

    return extractedChunks;
  }

  extractedChunksByChunk(htmlPluginData, compilation) {
    const options = this.options;
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
    } else if (options.include === 'allChunks' || options.include === 'all') {
      if (options.include === 'all') {
        /* eslint-disable no-console */
        console.warn('[WARNING]: { include: "all" } is deprecated, please use "allChunks" instead.');
        /* eslint-enable no-console */
      }
      // Async chunks, vendor chunks, normal chunks.
      extractedChunks = compilation.chunks;
    } else if (options.include === 'allAssets') {
      extractedChunks = [{files: Object.keys(compilation.assets)}];
    } else if (Array.isArray(options.include)) {
      // Keep only user specified chunks
      extractedChunks = compilation
        .chunks
        .filter((chunk) => {
          const chunkName = chunk.name;
          // Works only for named chunks
          if (!chunkName) {
            return false;
          }
          return options.include.indexOf(chunkName) > -1;
        });
    }

    // only handle the chunks associated to this htmlWebpackPlugin instance, in case of multiple html plugin outputs
    // allow `allAssets` mode to skip, as assets are just files to be filtered by black/whitelist, not real chunks
    if (options.include !== 'allAssets') {
      extractedChunks = extractedChunks.filter(chunk => doesChunkBelongToHTML(
        chunk, Object.values(htmlPluginData.assets.chunks), {}));
    }
    return extractedChunks;
  }

  addLinksBasedOnChunks(extractedChunks, compilation, htmlPluginData, cb) {
    const options = this.options;
    let filesToInclude = '';
    const publicPath = compilation.outputOptions.publicPath || '';
    flatten(extractedChunks.map(chunk => chunk.files))
      .filter(entry => {
        return (
          !this.options.fileWhitelist ||
          this.options.fileWhitelist.some(regex => regex.test(entry) === true)
        );
      })
      .filter(entry => {
        return this.options.fileBlacklist.every(regex => regex.test(entry) === false);
      }).forEach(entry => {
        entry = `${publicPath}${entry}`;
        if (options.rel === 'preload') {
          // If `as` value is not provided in option, dynamically determine the correct
          // value depends on suffix of filename. Otherwise use the given `as` value.
          let asValue;
          if (!options.as) {
            if (entry.match(/\.css$/)) asValue = 'style';
            else if (entry.match(/\.woff2$/)) asValue = 'font';
            else asValue = 'script';
          } else if (typeof options.as === 'function') {
            asValue = options.as(entry);
          } else {
            asValue = options.as;
          }
          const crossOrigin = asValue === 'font' ? 'crossorigin="crossorigin" ' : '';
          filesToInclude+= `<link rel="${options.rel}" as="${asValue}" ${crossOrigin}href="${entry}">`;
        } else {
          // If preload isn't specified, the only other valid entry is prefetch here
          // You could specify preconnect but as we're dealing with direct paths to resources
          // instead of origins that would make less sense.
          filesToInclude+= `<link rel="${options.rel}" href="${entry}">`;
        }
      });
    if (htmlPluginData.html.indexOf('</head>') !== -1) {
      // If a valid closing </head> is found, update it to include preload/prefetch tags
      htmlPluginData.html = htmlPluginData.html.replace('</head>', filesToInclude + '</head>');
    } else {
      // Otherwise assume at least a <body> is present and update it to include a new <head>
      htmlPluginData.html = htmlPluginData.html.replace('<body>', '<head>' + filesToInclude + '</head><body>');
    }
    cb(null, htmlPluginData);
  }
}

module.exports = PreloadPlugin;
