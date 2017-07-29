# PRPL example with Webpack 3 and React

Note: this is a fork of https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/ which includes
usage of the Preload plugin and SW Precache.

Demonstrating PRPL in 7 steps - from a bundled app to code splitting and chunk preloading. 

You can also [see the preso](http://www.slideshare.net/grgur/prpl-pattern-with-webpack-and-react) that accompanies this source code sample. 

## Stack

- [x] [Webpack 3](https://webpack.github.io)
- [x] [React 15.4](https://facebook.github.io/react/)
- [x] [Babel 6](https://babeljs.io/)

## Steps
* [Step 0](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/tree/steps/0-bundled-up) - Bundled application
* [Step 1](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/tree/steps/01-route-splitting) - Route Splitting
* [Step 2](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/tree/steps/2-preload-and-preexecute) - Preload and parse JS with React Router's [getComponent](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/blob/steps/2-preload-and-preexecute/client/containers/App/index.js#L6)
* [Step 3](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/tree/steps/3-preload-no-execute) - Preload with '<link rel=preload />' and React Helmet
* [Step 4](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/tree/steps/4-automatic-preload) - [Custom Webpack plugin](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/blob/steps/4-automatic-preload/webpack.config.js#L43) that creates a JSON file with chunk names
* [Step 5](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/tree/steps/5-injected-chunk-names) - Custom Webpack 3 plugin that [automatically injects chunk information into HTML](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/blob/steps/5-injected-chunk-names/webpack.config.js#L46). Still using React Helmet to preload chunks
* [Step 6](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/tree/steps/6-no-helmet-scripttags) - Removed React Helmet dependency and [injecting code with raw JS](https://github.com/ModusCreateOrg/react-dynamic-route-loading-es6/blob/steps/6-no-helmet-scripttags/client/containers/App/index.js#L8) (simplicity FTW)

## Browser setup
I recommend you use Google Chrome with the following setup to benchmark the differences:
* Clean browser, no plugins (private mode is fine) 
* Disable caching
* Bandwidth throttling to Regular 3G
* CPU throttling to 5x slowdown

All of these are in Network and Timeline tabs of Chrome DevTools.  

## System Requirements
Before installing the dependencies, make sure your system has the correct Node and Npm versions.

- Node 6+
- Npm 3+

## Setup

```
$ npm install
```

## Running in Dev mode

```
$ npm start
```

## Running in Prod mode

```
$ npm run prod
```

## Need help?
[Reach out](https://moduscreate.com), we'd love to see how we can help your project. 
