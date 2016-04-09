var _ = require('lodash');
var ErrorHandler = require('../utils/error-handler');

/**
 * Command category represents comand category
 */
function Category(name, description, options){
  this.commands = {};
  this.name = name || '$0';
  this.description = description || '';
  this.options = options || {};
  this.parent = null;

  Object.defineProperty(this, 'path', {
    enumerable: true,
    get: function(){
      return this.parent
        ? this.parent.path.concat([this.name])
        : [this.name];
    }
  });
}

Category.prototype.command = function(command){
  this.commands[command.name] = command;
  command.parent = this;
  return this;
};

Category.prototype.run = function(yargs){
  var self = this;
  var errorHandler = ErrorHandler.createErrorHandler(yargs);

  _.forEach(this.commands, function(command){
    yargs.command(command.name, command.description, command.run.bind(command));
  });

  if(this.options.setup) this.options.setup(yargs);
  if(this.options.options) yargs.options(this.options.options);
  if(this.options.examples) _.forEach(this.options.examples, yargs.example.bind(yargs));
  if(this.options.version) yargs.version(this.options.version);

  yargs
    .usage('Usage: ' + this.path.join(' ') + ' <command>')
    .check(function(argv){
      var commandName = argv._[self.path.length - 1];
      var command = self.commands[commandName];

      if(!commandName) throw ErrorHandler.usageError('Please enter a valid command.');
      if(!command) throw ErrorHandler.usageError('No such command `'
        + self.path.slice(1).join(' ') + ' '
        + commandName + '`');

      return true;
    })
    .demand(self.path.length, 'Please enter a valid command.')
    .fail(errorHandler);

  yargs.help('help');

  return yargs.argv;
};

module.exports = Category;