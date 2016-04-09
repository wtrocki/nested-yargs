var Yargs = require('yargs');
var _ = require('lodash');
var Category= require('./lib/model/category');
var Command = require('./lib/model/command');

var Cli = module.exports;

Cli.createApp = function (options) {
    return new Category('$', '', options);
};

Cli.createCategory = function (name, description, options) {
    if (_.isObject(description)) {
        options = description;
        description = '';
    }
    return new Category(name, description, options);
};

Cli.createCommand = function (name, description, options) {
    if (_.isObject(name)) {
        options = name;
        name = '$0';
        description = '';
    }
    if (_.isObject(description)) {
        options = description;
        description = '';
    }
    return new Command(name, description, options);
};

Cli.run = function (command, yargs) {
    return  command.run(yargs || Yargs);
};
