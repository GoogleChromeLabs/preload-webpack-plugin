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

const insertLinksIntoHead = require('../../src/lib/insert-links-into-html');

describe(`Edge Conditions:`, function() {
  it(`should throw when called with HTML lacking a </head> or <body>`, function(done) {
    const html = '<html></html>';
    expect(
        () => insertLinksIntoHead({html, links: ['<link>'], target: 'head'})
    ).toThrowError(`The HTML provided did not contain a </head> or a <body>:\n\n<html></html>`);

    done();
  });

  it(`should return the HTML as-is when there are no links`, function(done) {
    const html = '<html><body></body></html>';
    const updatedHtml = insertLinksIntoHead({html});

    expect(updatedHtml).toEqual(html);

    done();
  });
});

describe(`Normal Conditions:`, function() {
  it(`should support inserting a single link prior to the </head>`, function(done) {
    const html = '<html><head></head><body></body></html>';
    const updatedHtml = insertLinksIntoHead({
      html,
      links: ['<link>'],
      target: 'head',
    });

    expect(updatedHtml).toEqual(`<html><head><link></head><body></body></html>`);

    done();
  });

  it(`should support inserting multiple links prior to the </head>`, function(done) {
    const html = '<html><head></head><body></body></html>';
    const updatedHtml = insertLinksIntoHead({
      html,
      links: ['<link1>', '<link2>'],
      target: 'head',
    });

    expect(updatedHtml).toEqual(`<html><head><link1><link2></head><body></body></html>`);

    done();
  });

  it(`should support creating a <head> and inserting a single link prior to the </head> when there is no <head>`, function(done) {
    const html = '<html><body></body></html>';
    const updatedHtml = insertLinksIntoHead({
      html,
      links: ['<link1>'],
      target: 'head',
    });

    expect(updatedHtml).toEqual(`<html><head><link1></head><body></body></html>`);

    done();
  });

  it(`should support creating a head and inserting multiple links prior to the </head> when there is no <head>`, function(done) {
    const html = '<html><body></body></html>';
    const updatedHtml = insertLinksIntoHead({
      html,
      links: ['<link1>', '<link2>'],
      target: 'head',
    });

    expect(updatedHtml).toEqual(`<html><head><link1><link2></head><body></body></html>`);

    done();
  });

  // target: body
  it(`should support inserting a single link prior to the </body>`, function(done) {
    const html = '<html><head></head><body></body></html>';
    const updatedHtml = insertLinksIntoHead({
      html,
      links: ['<link>'],
      target: 'body',
    });

    expect(updatedHtml).toEqual(`<html><head></head><body><link></body></html>`);

    done();
  });

  it(`should support inserting multiple links prior to the </body>`, function(done) {
    const html = '<html><head></head><body></body></html>';
    const updatedHtml = insertLinksIntoHead({
      html,
      links: ['<link1>', '<link2>'],
      target: 'body',
    });

    expect(updatedHtml).toEqual(`<html><head></head><body><link1><link2></body></html>`);

    done();
  });

  it(`should support creating a body and inserting a single link prior to the </body> when there is no <body>`, function(done) {
    const html = '<html><head></head></html>';
    const updatedHtml = insertLinksIntoHead({
      html,
      links: ['<link1>'],
      target: 'body',
    });

    expect(updatedHtml).toEqual(`<html><head></head><body><link1></body></html>`);

    done();
  });

  it(`should support creating a body and inserting multiple links prior to the </body> when there is no </body>`, function(done) {
    const html = '<html><head></head></html>';
    const updatedHtml = insertLinksIntoHead({
      html,
      links: ['<link1>', '<link2>'],
      target: 'body',
    });

    expect(updatedHtml).toEqual(`<html><head></head><body><link1><link2></body></html>`);

    done();
  });
});
