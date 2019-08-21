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

const assert = require('assert');

function createHTMLElementString({elementName, attributes={}, closingTagRequired=false}) {
  assert(elementName, 'Please provide an element name.');
  assert(!(/\W/.test(elementName)), 'The element name contains invalid characters.');

  const attributeStrings = [];
  for (const [attributeName, attributeValue] of Object.entries(attributes).sort()) {
    if (attributeValue === '') {
      attributeStrings.push(attributeName);
    } else {
      attributeStrings.push(`${attributeName}=${JSON.stringify(attributeValue)}`);
    }
  }

  let elementString = `<${elementName}`;

  if (attributeStrings.length > 0) {
    elementString += ' ' + attributeStrings.join(' ');
  }

  elementString += '>';

  if (closingTagRequired) {
    elementString += `</${elementName}>`;
  }

  return elementString;
}

module.exports = createHTMLElementString;
