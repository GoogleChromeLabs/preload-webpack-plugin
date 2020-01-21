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

function getInitialChunks(compilation) {
  return compilation.chunks.filter(chunk => {
    if ('canBeInitial' in chunk) {
      return !chunk.canBeInitial();
    } else {
      return !chunk.isInitial();
    }
  });
}

// This is an expensive operation as it uses getStats, but currently it is the only place we can get this data from.
function extractChildAssets(compilation, rel) {
  const stats = compilation.getStats().toJson({all: false, entrypoints: true, chunks: true});

  const assets = Object.keys(stats.entrypoints).reduce((childAssets, entrypointKey) => {
    const entrypoint = stats.entrypoints[entrypointKey];
    childAssets = childAssets.concat(entrypoint.chunks.map(chunkId => stats.chunks.find(chunk => chunk.id === chunkId)));

    if (entrypoint.childAssets && entrypoint.childAssets[rel]) {
      childAssets.push({files: entrypoint.childAssets[rel]});
    }

    return childAssets;
  }, []);

  return assets;
}

function extractChunks({compilation, optionsInclude, rel}) {
  try {
    // 'asyncChunks' are chunks intended for lazy/async loading usually generated as
    // part of code-splitting with import() or require.ensure(). By default, asyncChunks
    // get wired up using link rel=preload when using this plugin. This behavior can be
    // configured to preload all types of chunks or just prefetch chunks as needed.
    if (optionsInclude === undefined || optionsInclude === 'asyncChunks') {
      return compilation.chunks.filter(chunk => {
        if ('canBeInitial' in chunk) {
          return !chunk.canBeInitial();
        } else {
          return !chunk.isInitial();
        }
      });
    }

    if (optionsInclude === 'initial') {
      return getInitialChunks(compilation);
    }

    if (optionsInclude === 'entryAndChildren') {
      return extractChildAssets(compilation, rel);
    }

    if (optionsInclude === 'allChunks') {
      // Async chunks, vendor chunks, normal chunks.
      return compilation.chunks;
    }

    if (optionsInclude === 'allAssets') {
      // Every asset, regardless of which chunk it's in.
      // Wrap it in a single, "psuedo-chunk" return value.
      return [{files: Object.keys(compilation.assets)}];
    }

    if (Array.isArray(optionsInclude)) {
      // Keep only user specified chunks.
      return compilation.chunks.filter((chunk) => chunk.name && optionsInclude.includes(chunk.name));
    }
  } catch (error) {
    return compilation.chunks;
  }

  throw new Error(`The 'include' option isn't set to a recognized value: ${optionsInclude}`);
}

module.exports = extractChunks;
