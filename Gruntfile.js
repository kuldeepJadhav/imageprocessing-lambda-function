/*jshint camelcase: false */
'use strict';
var path = require('path');


module.exports = function(grunt) {

    var testCoverageThresholds = {
        'statements': 83.24,
        'branches': 75.03,
        'functions': 75.07,
        'lines': 82.29
    };
    // Project configuration.
    grunt.initConfig({
        env: {
            options: {
                //Shared Options Hash
            },
            test: {
                NODE_ENV: 'test'
            },
            dev: {
                NODE_ENV: 'dev'
            },
            qa: {
                NODE_ENV: 'qa'
            },
            prod: {
                NODE_ENV: 'prod'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: []
            },
            test: {
                src: []
            }
        },
        mocha_istanbul: {
            coverage: {
                src: [
                    ['./test/helper/testConfig.js', './test/**/*Spec.js']
                ], // a folder works nicely
                options: {
                    check: testCoverageThresholds,
                    excludes: ['*Spec.js']
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib']
            },
            // This is not needed as all the tests are along with source and express task will
            // rerun the tests. If we enable this, the 'jshint:test', 'unittest' will be run twice. One from here
            // and the other from express task
            //            test: {
            //                files: '<%= jshint.test.src %>',
            //                tasks: ['jshint:test', 'unittest']
            //            },
            express: {
                files: '<%= jshint.lib.src %>',
                excludes: ['<%= jshint.test.src %>'],
                tasks: ['jshint:test', 'unittest', 'express:prod'],
                options: {
                    spawn: false //Must have for reload
                }
            }
        },
        express: {
            options: {
                // Override node env's PORT
                port: 3002,

                // Override node env's NODE_ENV
                node_env: undefined,

                // Set --debug
                debug: true,
                hostname: '0.0.0.0',
                script: 'app.js'
            },
            dev: {
                options: {
                    script: 'app.js'
                }
            },
            prod: {
                options: {
                    script: 'app.js',
                    node_env: 'prod'
                }
            },
            livereload: {
                options: {
                    server: path.resolve('app.js'),
                    livereload: true,
                    serverreload: true,
                    bases: [path.resolve('routes'), path.resolve('models')]
                }
            }
        },
        copy: {
            main: {
                files: [
                    

                    // includes files within path and its sub-directories
                    {
                        expand: true,
                        src: ['./lib/**', './package.json', './water-mark-*.png', './app.js', './imageProcessing.js', './node_modules/**'],
                        dest: 'dist/'
                    }
                ],
            },
        },

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.registerTask('unittest', ['mocha_istanbul:coverage']);
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task.
    grunt.registerTask('default', [
        //'test',
        'env:dev',
        'express:dev',
        'watch'
    ]);


    grunt.registerTask('test', [
        'env:test',
        'jshint:test',
        'unittest'
    ]);
};