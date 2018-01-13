const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const PreloadPlugin = require('../')

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const sourcePath = path.join(__dirname, './client');
const staticsPath = path.join(__dirname, './static');

/**
 * Plugins for dev and prod
 */
const plugins = [
  /**
   * Extract vendor libraries into a separate bundle
   */
  // new webpack.optimize.CommonsChunkPlugin({
  //   name: 'vendor',
  //   minChunks: 2,
  //   filename: 'vendor.bundle.js'
  // }),

  /**
   * Define NODE_ENV.
   * When in production, this creates a smaller and faster bundle
   */
  new webpack.DefinePlugin({
    'process.env': { NODE_ENV: JSON.stringify(nodeEnv) }
  }),

  /**
   * This is how we create index.html
   */
  new HtmlWebpackPlugin({
    title: 'React Router + Webpack 2 + Dynamic Chunk Navigation',
    template: `${sourcePath}/index.ejs`,
    filename: 'index.html',
    chunks: [ 'bundle', 'vendor' ],
  }),
  new HtmlWebpackPlugin({
    title: 'another test page',
    template: `${sourcePath}/index.ejs`,
    filename: 'another.html',
    chunks: [ 'another' ]
  }),

  /**
   * Precache resources using Service Workers
   */
  new SWPrecacheWebpackPlugin({
      cacheId: 'react-dynamic-route-loading-es6',
      filename: 'my-service-worker.js',
      runtimeCaching: [{
        handler: 'cacheFirst',
        urlPattern: /(.*?)/
      }],
    }),

  /**
   * Create a JSON file that contains file names of all chunks
   */
  function() {
    const compiler = this;
    const chunkRegEx = /^chunk[.]/;
    compiler.plugin('compilation', function(compilation) {
      compilation.plugin('html-webpack-plugin-before-html-processing', function(htmlPluginData, cb) {
        // find all chunk file names
        const extractedChunks = compilation
          .chunks
          .reduce((chunks, chunk) => chunks.concat(chunk.files), [])
          .filter(chunk => chunkRegEx.test(chunk));

        // create a stringified version of the array
        const json = JSON.stringify(extractedChunks);

        htmlPluginData.html = htmlPluginData.html.replace('window.__CHUNKS=[];', `window.__CHUNKS=${json}`);
        cb(null, htmlPluginData);
      });
    });
  },

  new PreloadPlugin({
    rel: 'preload',
    as: 'script'
  })
];


/**
 * Additional plugins just for prod
 */
if (isProd) {
  plugins.push(
    /**
     * Options to pass to all loaders
     */
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),

    /**
     * Minify JS
     */
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false
      },
    })
  );
}

module.exports = {
  devtool: isProd ? 'source-map' : 'eval',
  context: sourcePath,
  entry: {
    bundle: [
      'index',
      'pages/Home',
    ],
    vendor: [
      'react',
      'react-dom',
    ],
    another: [
      'another',
    ]
  },
  output: {
    path: staticsPath,
    filename: '[name].js',
    chunkFilename: 'chunk.[chunkhash].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.(gif|png|jpg|jpeg\ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: 'file-loader'
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      sourcePath,
      'node_modules'
    ]
  },
  plugins: plugins,
  devServer: {
    contentBase: './client',
    historyApiFallback: true,
    port: 3000,
    compress: isProd,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m',
      }
    },
  }
};
