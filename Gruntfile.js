/*
 * grunt-imagemin-backup
 * http://gruntjs.com/
 *
 * Copyright (c) 2015 Joschi Kuphal
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);

  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    clean: {
      test: ['tmp']
    },
    imageminbackup: {
      options: {
        backup: 'backup'
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: '**/*.{gif,GIF,jpg,JPG,png,PNG}',
          dest: 'test/fixtures'
        }]
      },
      rename: {
        files: {
          'tmp/rename.jpg': 'test/fixtures/test.jpg'
        }
      }
    },
    nodeunit: {
      tests: ['test/test.js']
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-internal');

  grunt.registerTask('test', [
    'jshint',
    'clean',
    'imageminbackup',
    'nodeunit',
    'clean'
  ]);

  grunt.registerTask('default', ['test', 'build-contrib']);
};
