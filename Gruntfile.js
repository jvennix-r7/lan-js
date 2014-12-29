module.exports = function(grunt) {
  // The order of these files is very important!
  // They will be concatenated in order, so make sure dependencies match position.
  var SRC_FILES = [
    'src/utils.js',
    'src/tcp_scan.js',
    'src/device_scan.js'
  ];

  grunt.loadNpmTasks('grunt-contrib-compress');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'src/*.js', 'spec/*.js']
    },
    concat: {
      dist: {
        src: SRC_FILES,
        dest: 'build/lan.js',
      }
    },
    uglify: {
      options: {
        compress: true,
        mangle: true,
        report: 'gzip',
        banner: '/*! <%= pkg.name %>@<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/lan.js',
        dest: 'build/lan.min.js'
      }
    },
    jasmine: {
      pivotal: {
        src: SRC_FILES,
        options: {
          specs: 'spec/**.js'
        }
      }
    },
    watch: {
      scripts: {
        files: ['spec/*.js', 'src/*.js'],
        tasks: ['jshint', 'jasmine'],
        options: {
          spawn: false,
        }
      }
    },
    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        files: [
          {expand: true, src: 'build/lan.min.js', ext: '.min.js.gz'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['jshint', 'jasmine', 'concat', 'uglify', 'compress']);
};
