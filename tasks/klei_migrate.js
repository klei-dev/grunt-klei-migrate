/*
 * grunt-klei-migrate
 *
 *
 * Copyright (c) 2013 Joakim Bengtson <joakim@klei.se>
 * Licensed under the MIT license.
 */

'use strict';

var cli = require('klei-migrate/lib/cli'),
    reporter = require('../reporters/grunt'),
    commands = ['run', 'create', 'dry', 'sync', 'post_checkout', 'status', 'new'],
    commandsToFunctions = {
      'status': 'dry',
      'new': 'create',
      'post_checkout': 'post-checkout'
    },
    availableOptions = ['limit', 'one', 'up', 'down', 'template', 'timeout', 'env', 'coffee', 'u', 'd', 'l', 't'];

module.exports = function(grunt) {

  cli.reporter(reporter(grunt));

  grunt.registerMultiTask('klei_migrate', 'A gruntplugin for klei-migrate', function() {
    var options = this.options(),
        done = this.async(),
        command = "run",
        args = [];

    if (options.command) {
      if (commands.indexOf(options.command) < 0) {
        grunt.fail.warn('Unknown command: "' + options.command + '"');
        done(false);
        return false;
      } else {
        command = options.command;
      }
    } else if (commands.indexOf(this.target) >= 0) {
      command = this.target;
    }

    command = commandsToFunctions[command] || command;

    args.push(command);

    delete options.command;

    var fromBranch, fromRef, toRef;
    if (command === 'sync') {
      fromBranch = grunt.option('fromBranch') || options.fromBranch;
      delete options.fromBranch;
    } else if (command === 'post-checkout') {
      fromRef = grunt.option('fromRef') || options.fromRef;
      toRef = grunt.option('toRef') || options.toRef;
      delete options.fromRef;
      delete options.toRef;
    }

    availableOptions.forEach(function (name) {
      var option = grunt.option(name) || options[name];
      if (typeof option !== 'undefined') {
        args.push('--' + name);
        if (typeof option !== 'boolean') {
          args.push(option.toString());
        }
      }
    });

    if (arguments.length) {
      args.push.apply(args, arguments);
    } else if (fromBranch) {
      args.push(fromBranch);
    } else if (fromRef) {
      args.push(fromRef, toRef, '1');
    }

    cli.init(args).exec(function (err) {
      done(err);
    });
  });

};
