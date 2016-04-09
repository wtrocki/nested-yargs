var ErrorHandler = require("./error-handler");

// Adapted from: https://github.com/bcoe/yargs/blob/master/lib/validation.js#L83-L110
function checkForUnknownArguments (yargs, argv) {
    var aliasLookup = {};
    var descriptions = yargs.getUsageInstance().getDescriptions();
    var demanded = yargs.getDemanded();
    var unknown = [];

    Object.keys(yargs.parsed.aliases || {}).forEach(function (key) {
        yargs.parsed.aliases[key].forEach(function (alias) {
            aliasLookup[alias] = key;
        });
    });

    Object.keys(argv).forEach(function (key) {
        if (key !== '$0' && key !== '_' && key !== 'params' &&
            !descriptions.hasOwnProperty(key) &&
            !demanded.hasOwnProperty(key) &&
            !aliasLookup.hasOwnProperty('no-' + key) &&
            !aliasLookup.hasOwnProperty(key)) {
                unknown.push(key);
        }
    });

    if (unknown.length === 1) {
        throw ErrorHandler.usageError('Unknown argument: ' + unknown[0]);
    } else if (unknown.length > 1) {
        throw ErrorHandler.usageError('Unknown arguments: ' + unknown.join(', '));
    }
}

function parseParams (yargs, argv, command) {
    var required = 0;
    var optional = 0;
    var variadic = false;

    argv.params = {};

    command.options.params.replace(/(<[^>]+>|\[[^\]]+\])/g,
        function (match) {
            if (variadic)
                throw ErrorHandler.applicationError('Variadic parameters must the final parameter.');

            var isRequired = match[0] === '<';
            var param = match
                .slice(1, -1)
                .replace(/(.*)\.\.\.$/, function (m, param) {
                    variadic = true;
                    return param;
                });
            var value;

            if (isRequired) required++;
            else optional++;

            if (variadic) {
                value = argv._.slice(command.path.length - 2 + required + optional)
                    .map(String);

                if (isRequired && !value.length) throw ErrorHandler.usageError('Parameter '+ '`' + param + '` is must have at least one item.');
            } else {
                if (isRequired && optional > 0)
                    throw ErrorHandler.applicationError('Optional parameters must be specified last');

                value = argv._[command.path.length - 2 + required + optional];

                if (value) value = String(value);

                if (isRequired && typeof value === 'undefined') throw ErrorHandler.usageError('Parameter ' + '`' + param + '` is required.');
            }

            argv.params[param] = value;
        });
}


module.exports.parseParams = parseParams;
module.exports.checkForUnknownArguments = checkForUnknownArguments;