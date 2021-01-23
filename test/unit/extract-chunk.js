/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const extractChunk = require('../../src/lib/extract-chunks');

const stubEntrypoints = {
  entry1: {
    chunks: ['chunk1', 'chunk2'],
    childAssets: {}
  }
};

const stubEntrypointsWithPreloadedChildren = {
  entry1: {
    chunks: ['chunk1', 'chunk2'],
    childAssets: {}
  },
  entry2: {
    chunks: ['chunk3'],
    childAssets: {preload: ['file4.js']}
  }
};

const stubChunks = [
  {id: 'chunk1', files: ['file1.js']},
  {id: 'chunk2', files: ['file2.js']},
  {id: 'chunk3', files: ['file3.js']},
];

class StubCompilation {
  constructor(entrypoints, chunks) {
    this.entrypoints = entrypoints;
    this.chunks = chunks;
  }

  getStats() {
    return {
      toJson: () => ({
        entrypoints: this.entrypoints,
        chunks: this.chunks
      })
    };
  }
}

describe(`Entry and Children:`, function() {
  it(`Includes entrypoints`, function() {
    const compilation = new StubCompilation(stubEntrypoints, stubChunks);
    const chunks = extractChunk({
      compilation,
      optionsInclude: 'entryAndChildren',
      rel: 'preload'
    });
    expect(chunks).toEqual(stubChunks.slice(0, 2));
  });

  it(`Includes entrypoints and children`, function() {
    const compilation = new StubCompilation(stubEntrypointsWithPreloadedChildren, stubChunks);
    const chunks = extractChunk({
      compilation,
      optionsInclude: 'entryAndChildren',
      rel: 'preload'
    });
    expect(chunks).toEqual(stubChunks.concat({files: ['file4.js']}));
  });

  it(`Only includes entrypoints matching the rel option`, function() {
    const compilation = new StubCompilation(stubEntrypointsWithPreloadedChildren, stubChunks);
    const chunks = extractChunk({
      compilation,
      optionsInclude: 'entryAndChildren',
      rel: 'prefetch'
    });
    expect(chunks).toEqual(stubChunks);
  });
});
