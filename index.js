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
class PreloadPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
      const chunkRegEx = /^chunk[.]/;
      let self = this;
      let filesToInclude = '';
      let extractedChunks = [];
      compiler.plugin('compilation', compilation => {
        compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, cb) => {
          if (self.options.rel === undefined) {
              self.options.rel = 'preload';
          }

          if (self.options.as === undefined) {
              self.options.as = 'script';
          }

          if (self.options.include === undefined || self.options.include === 'asyncChunks') {
              let asyncChunksSource = compilation
              .chunks.filter(chunk => !chunk.isInitial())
              .map(chunk => chunk.files);
              extractedChunks = [].concat(...asyncChunksSource);
          } else if (self.options.include === 'all') {
              // Async chunks, vendor chunks, normal chunks.
              extractedChunks = compilation
                .chunks
                .reduce((chunks, chunk) => chunks.concat(chunk.files), []);
          }
          extractedChunks.forEach(entry => {
            if (self.options.rel === 'preload') {
              filesToInclude+= `<link rel="${self.options.rel}" src="/${entry}" as="${self.options.as}">\n`;
            } else {
              filesToInclude+= `<link rel="${self.options.rel}" src="/${entry}">\n`;
            }
          })
          filesToInclude+= '</head>';
          htmlPluginData.html = htmlPluginData.html.replace('</head>', filesToInclude);
          cb(null, htmlPluginData);
        });
      });
  }
}

module.exports = PreloadPlugin;