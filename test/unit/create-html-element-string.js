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

const createHtmlElementString = require('../../src/lib/create-html-element-string');

describe(`Error Conditions:`, function() {
  it(`should throw when called without an elementName`, function(done) {
    expect(
        () => createHtmlElementString({})
    ).toThrowError('Please provide an element name.');

    done();
  });

  it(`should throw when called with an elementName matching \\W`, function(done) {
    expect(
        () => createHtmlElementString({elementName: 'Testing!'})
    ).toThrowError('The element name contains invalid characters.');

    done();
  });
});

describe(`Defaults Tests:`, function() {
  it(`should support usage with just an elementName, and defaults for everything else`, function(done) {
    const elementString = createHtmlElementString({
      elementName: 'test',
    });

    expect(elementString).toEqual('<test>');

    done();
  });
});

describe(`Attributes Tests:`, function() {
  it(`should support attributes without values`, function(done) {
    const elementString = createHtmlElementString({
      elementName: 'test',
      attributes: {
        one: '',
        two: '',
      }
    });

    expect(elementString).toEqual('<test one two>');

    done();
  });

  it(`should support a mix of attributes with and without values`, function(done) {
    const elementString = createHtmlElementString({
      elementName: 'test',
      attributes: {
        one: '',
        two: '2'
      }
    });

    expect(elementString).toEqual('<test one two="2">');

    done();
  });

  it(`should add the attributes sorted in alphanumeric order`, function(done) {
    const elementString = createHtmlElementString({
      elementName: 'test',
      attributes: {
        xyz: '3',
        abc: '1',
        def: '2'
      }
    });

    expect(elementString).toEqual('<test abc="1" def="2" xyz="3">');

    done();
  });

  it(`should properly escape the attribute values as strings`, function(done) {
    const elementString = createHtmlElementString({
      elementName: 'test',
      attributes: {
        string: `Strings: '"\``
      }
    });

    expect(elementString).toEqual('<test string="Strings: \'\\"`">');

    done();
  });
});

describe(`Closing Tag Tests:`, function() {
  it(`should add a closing tag when specified`, function(done) {
    const elementString = createHtmlElementString({
      elementName: 'test',
      closingTagRequired: true,
    });

    expect(elementString).toEqual('<test></test>');

    done();
  });
});
