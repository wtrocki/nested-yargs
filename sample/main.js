var Cli = require('../../index');

// The 'root' of our app is an anonymous category
var app = Cli.createApp();

// You add categories and commands using the `.command()` method.
app.command(Cli.createCommand('init', 'Initialize the this tool.', {
  handler: function (argv) {
      console.log("Called init", argv.test);
  }
}));

// You can nest categories as deep as you would like
var widgets = Cli.createCategory('keys', 'Manage your inventory of widgets.');

widgets.command(Cli.createCommand('ls', 'List your widgets.', {
  // Options follow the yarg option format
  options: {
    color: {
      alias: 'c',
      description: 'Only list widgets of the given color.',
      type: 'string'
    }
  },
  handler: function (argv) {
    console.log("Called ls", argv.test);
  }
}));
// The ls command is now available at `widgets.commands.ls`

// Alias `widgets ls` to the top-level command `widgets ls`
app.command(Cli.createCommand('ls', widgets.commands.ls.description,
  widgets.commands.ls.options));

app.command(widgets);

Cli.run(app);