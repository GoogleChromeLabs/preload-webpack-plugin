"use strict";

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
function insertLinksIntoHead({
  html,
  links = []
}) {
  if (links.length === 0) {
    return html;
  }

  if (html.includes('</head>')) {
    // If a valid closing </head> is found, insert the new <link>s right before it.
    return html.replace('</head>', links.join('') + '</head>');
  }

  if (html.includes('<body>')) {
    // If there's a <body> but no <head>, create a <head> containing the <head>.
    return html.replace('<body>', `<head>${links.join('')}\n</head><body>`);
  }

  throw new Error(`The HTML provided did not contain a </head> or a <body>:\n\n${html}`);
}

module.exports = insertLinksIntoHead;