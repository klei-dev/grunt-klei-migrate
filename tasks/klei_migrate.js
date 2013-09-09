/*
 * grunt-klei-migrate
 *
 *
 * Copyright (c) 2013 Joakim Bengtson <joakim@klei.se>
 * Licensed under the MIT license.
 */

'use strict';

var migrate = require('klei-migrate'),
    commands = ['run', 'create', 'dry'];

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

    migrate.env(grunt.option('env') || options.env);

    migrate.limit(grunt.option('limit') || options.limit);

    migrate.timeout((grunt.option('timeout') || options.timeout) * 1000);

    migrate.templatePath(grunt.option('template') || options.template);

    migrate.direction(up ? 'up' : 'down');

    migrate.args([].slice.call(arguments));

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
          migratable.forEach(function (file) {
              grunt.log.writeln('  - '.yellow + file);
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
      toMigrate = migratable.slice();
    });

    migrate.on('run:migrate:after', function (file) {
      toMigrate.shift();
      grunt.log.ok(file + ' migrated'.green);
    });

    migrate.on('run:migrate:fail', function (err, file) {
      toMigrate.shift();
      grunt.log.warn(file + ' failed: '.red + err.toString().red);
      toMigrate.forEach(function (left) {
          grunt.log.writeln(('>> ' + left + ' (skipped)').yellow);
      });
    });

    migrate.on('run:ready', function (migratable) {
      if (!migratable.length) {
        grunt.log.ok('No migrations found, nothing to do...');
        done();
      }
    });

    migrate.on('run:success', function () {
      done();
    });

    migrate.on('error', function (err) {
      grunt.log.writeln('');
      grunt.fail.fatal(err);
      done(err);
    });

    migrate[command]();
  });

};
