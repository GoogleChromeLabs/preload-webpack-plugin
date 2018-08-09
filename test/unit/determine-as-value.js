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

const determineAsValue = require('../../src/lib/determine-as-value')

describe(`Error Conditions:`, function () {
  it(`should throw when called without an href value`, function (done) {
    expect(
      () => determineAsValue({ optionsAs: 'ignored' })
    ).toThrowError(`The 'href' parameter was not provided.`)

    done()
  })

  it(`should throw when called with an invalid optionsAs value`, function (done) {
    expect(
      () => determineAsValue({ href: '/', optionsAs: {}})
    ).toThrowError(`The 'as' option isn't set to a recognized value: [object Object]`)

    done()
  })
})

describe(`OptionsAs Tests:`, function () {
  it(`should support passing in a string`, function (done) {
    const asValue = determineAsValue({ href: '/', optionsAs: 'test' })

    expect(asValue).toEqual('test')

    done()
  })

  it(`should support passing in a function`, function (done) {
    const asValue = determineAsValue({ href: '/', optionsAs: (href) => href + 'test' })

    expect(asValue).toEqual('/test')

    done()
  })

  it(`should support passing in undefined, when href ends with .css`, function (done) {
    const asValue = determineAsValue({ href: '/test.css' })

    expect(asValue).toEqual('style')

    done()
  })

  it(`should support passing in undefined, when href ends with .woff2`, function (done) {
    const asValue = determineAsValue({ href: '/test.woff2' })

    expect(asValue).toEqual('font')

    done()
  })

  it(`should support passing in undefined, when href ends with .js`, function (done) {
    const asValue = determineAsValue({ href: '/test.js' })

    expect(asValue).toEqual('script')

    done()
  })

  it(`should support passing in undefined, when href ends with anything else`, function (done) {
    const asValue = determineAsValue({ href: '/test.ignored' })

    expect(asValue).toEqual('script')

    done()
  })
})
