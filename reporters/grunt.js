
var path = require('path');

module.exports = function (grunt) {
  return function (migrate) {
    var toMigrate;

    migrate.on('create:init', function () {
      grunt.log.subhead('Creating migration');
    });

    migrate.on('create:success', function (name, dir) {
      grunt.log.ok('Migration: ' + path.relative(migrate.cwd(), path.join(dir, name)) + ' created');
    });

    migrate.on('dry:init', function () {
      grunt.log.subhead('Possible migrations');
    });

    migrate.on('dry:success', function (migratable) {
      if (migratable.length) {
          migratable.forEach(function (item) {
              grunt.log.writeln('  - '.yellow + item.migration);
          });
      } else {
          grunt.log.ok('There is nothing to migrate!');
      }
    });

    migrate.on('run:init', function () {
      grunt.log.subhead('Running migrations ' + migrate.direction().yellow);
    });

    migrate.on('run:ready', function (migratable) {
      if (!migratable.length) {
        grunt.log.ok('No migrations found, nothing to do...');
        return;
      }
      toMigrate = migratable.slice();
    });

    migrate.on('run:success', function () {
    });

    var inSync = false;
    var syncReady = function (migratable) {
      if (!migratable.length) {
        grunt.log.ok('Already in sync, nothing to do...');
        return;
      }
      inSync = true;
      toMigrate = migratable.slice();
    };

    var syncSuccess = function () {
      grunt.log.ok('\nYour branch is now in sync!');
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
    });

  };
};
