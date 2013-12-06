/*
 * grunt-klei-migrate
 *
 *
 * Copyright (c) 2013 Joakim Bengtson <joakim@klei.se>
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    clean: ['migrations'],

    // Configuration to be run (and then tested).
    klei_migrate: {
      run: "",
      create: {
        options: {
          template: 'test/dummy.tpl'
        }
      },
      dry: "",
      next: {
        options: {
          command: 'run',
          limit: 1
        }
      },
      revert: {
        options: {
          command: 'run',
          limit: 1,
          down: true
        }
      },
      sync: {
        options: {
          fromBranch: 'master'
        }
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'klei_migrate']);

};
