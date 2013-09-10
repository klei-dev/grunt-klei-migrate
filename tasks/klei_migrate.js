/*
 * grunt-klei-migrate
 *
 *
 * Copyright (c) 2013 Joakim Bengtson <joakim@klei.se>
 * Licensed under the MIT license.
 */

'use strict';

var migrate = require('klei-migrate'),
    commands = ['run', 'create', 'dry', 'sync', 'post_checkout', 'status', 'new'],
    commandsToFunctions = {
      'status': 'dry',
      'new': 'create',
      'post_checkout': 'post-checkout'
    };

module.exports = function(grunt) {

  grunt.registerMultiTask('klei_migrate', 'A gruntplugin for klei-migrate', function() {

    var options = this.options(),
        done = this.async(),
        up = grunt.option('up') || options.up && !grunt.option('down') || !grunt.option('down') && !options.down,
        command = "run",
        toMigrate;

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

    migrate.env(grunt.option('env') || options.env);

    migrate.limit(grunt.option('limit') || options.limit);

    migrate.timeout((grunt.option('timeout') || options.timeout) * 1000);

    migrate.templatePath(grunt.option('template') || options.template);

    migrate.direction(up ? 'up' : 'down');

    migrate.args([].slice.call(arguments));

    if (command === 'sync') {
      var fromBranch = grunt.option('fromBranch') || options.fromBranch;
      if (!migrate.args().length && fromBranch) {
        migrate.args([fromBranch]);
      }
    } else if (command === 'post-checkout') {
      var fromRef = grunt.option('fromRef') || options.fromRef,
          toRef = grunt.option('toRef') || options.toRef;
      if (!migrate.args().length && fromRef) {
        migrate.args([fromRef, toRef, '1']);
      }
    }

    migrate.on('create:init', function () {
      grunt.log.subhead('Creating migration');
    });

    migrate.on('create:success', function (name, dir) {
      grunt.log.ok('Migration: ' + name + ' created');
      done();
    });

    migrate.on('dry:init', function () {
      grunt.log.subhead('Possible migrations');
    });

    migrate.on('dry:success', function (migratable, migrated) {
      if (migratable.length) {
          migratable.forEach(function (item) {
              grunt.log.writeln('  - '.yellow + item.migration);
          });
      } else {
          grunt.log.ok('There is nothing to migrate!');
      }
      done();
    });

    migrate.on('run:init', function () {
      grunt.log.subhead('Running migrations ' + migrate.direction().yellow);
    });

    migrate.on('run:ready', function (migratable) {
      if (!migratable.length) {
        grunt.log.ok('No migrations found, nothing to do...');
        done();
        return;
      }
      toMigrate = migratable.slice();
    });

    migrate.on('run:success', function () {
      done();
    });

    var inSync = false;
    var syncReady = function (migratable) {
      if (!migratable.length) {
        grunt.log.ok('Already in sync, nothing to do...');
        done();
        return;
      }
      inSync = true;
      toMigrate = migratable.slice();
    };

    var syncSuccess = function () {
      grunt.log.ok('\nYour branch is now in sync!');
      done();
    };

    migrate.on('sync:init', function () {
      grunt.log.subhead('Syncing migrations with branch: ' + migrate.args()[0]);
    });
    migrate.on('sync:ready', syncReady);
    migrate.on('sync:success', syncSuccess);

    migrate.on('post-checkout:init', function () {
      grunt.log.subhead('Syncing migrations (post-checkout)');
    });
    migrate.on('post-checkout:ready', syncReady);
    migrate.on('post-checkout:success', syncSuccess);

    migrate.on('migrate:success', function (item) {
      toMigrate.shift();
      grunt.log.ok((inSync ? item.direction.yellow + ' ' : '') + item.migration + ' migrated'.green);
    });

    migrate.on('migrate:fail', function (err, item) {
      toMigrate.shift();
      grunt.log.warn((inSync ? item.direction.red + ' ' : '') + item.migration + ' failed: '.red + err.toString().red);
      toMigrate.forEach(function (left) {
          grunt.log.writeln(('>> ' + (inSync ? item.direction + ' ' : '') + left.migration + ' (skipped)').yellow);
      });
    });

    migrate.on('error', function (err) {
      grunt.log.writeln('');
      grunt.fail.fatal(err);
      done(err);
    });

    migrate[command]();
  });

};
