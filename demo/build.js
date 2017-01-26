/* eslint no-var: 0 */
var exec = require('child_process').exec;

var executable = (!process.argv[3].indexOf('server')) ? 'webpack-dev-server' : 'webpack';
var cmdLine = './node_modules/.bin/' + executable;
var environ = (!process.argv[2].indexOf('development')) ? 'development' : 'production';
var command;

if (process.platform === 'win32') {
  cmdLine = 'set NODE_ENV=' + environ + '&& ' + cmdLine;
} else {
  cmdLine = 'NODE_ENV=' + environ + ' ' + cmdLine;
}

command = exec(cmdLine);

command.stdout.on('data', function(data) {
  process.stdout.write(data);
});
command.stderr.on('data', function(data) {
  process.stderr.write(data);
});
command.on('error', function(err) {
  process.stderr.write(err);
});
