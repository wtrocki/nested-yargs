require('colors');

/**
 * Set of util methods for handling application and usage errors
 */
var errorHandler = module.exports;

errorHandler.createErrorHandler=function  (yargs) {
  return function (err) {
    if (!err || !(err instanceof Error) || err.isUsageError){
      yargs.showHelp();
    }

    console.log((err.message || err).red);
    process.exit(1);
  };
};

errorHandler.usageError = function (message, data) {
  var error = new Error(message ? message : undefined);
  error.data = data || null;
  error.isUsageError = true;
  return error;
};

errorHandler.applicationError = function (message, data) {
  var error = new Error(message ? message : undefined);
  error.data = data || null;
  error.isApplicationError = true;
  return error;
};