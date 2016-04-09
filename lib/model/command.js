var Bluebird = require('bluebird');
var _ = require('lodash');
var ErrorHandler = require('../utils/error-handler');
var yargsUtils = require('../utils/yargs-utils');

function Command(name, description, options){
  this.name = name || '$0';
  this.description = description || '';
  this.parent = null;
  this.options = _.defaultsDeep(options || {}, {
    params: ''
  });

  Object.defineProperty(this, 'path', {
    enumerable: true,
    get: function(){
      return this.parent
        ? this.parent.path.concat([this.name])
        : [this.name];
    }
  });
}

Command.prototype.run = function(yargs){
  var self = this;
  var errorHandler = ErrorHandler.createErrorHandler(yargs);
  if(this.options.setup) this.options.setup(yargs);
  if(this.options.options) yargs.options(this.options.options);
  if(this.options.examples) _.forEach(this.options.examples, yargs.example.bind(yargs));
  if(this.options.version) yargs.version(this.options.version);

  yargs
    .check(function(argv){
      // We can't use `yargs.strict()` because it is possible that
      // `options.setup` changes the options during execution and this
      // seems to interfere with the timing for strict mode.
      // Additionally, `yargs.strict()` does not seem to handle pre-
      // negated params like `--no-parse`.
      yargsUtils.checkForUnknownArguments(yargs, argv);
      if(self.options.params) yargsUtils.parseParams(yargs, argv, self);

      return true;
    })
    .fail(errorHandler)
    .usage('Usage: ' + this.path.join(' ')
      + ' [options]'
      + (this.options.params ? ' ' + this.options.params : ''));

  yargs.help('help');

  var argv = yargs.argv;

  if(this.options.handler)
    Bluebird.try(this.options.handler.bind(this, argv))
      .catch(errorHandler);

  return argv;
};

module.exports = Command;
