# grunt-imagemin-backup

> Minify PNG, JPEG, GIF and SVG images while keeping a backup copy of the original files

This Grunt task is basically a clone of the excellent [grunt-contrib-imagemin](https://github.com/gruntjs/grunt-contrib-imagemin) task and shares all its [features and options](https://github.com/gruntjs/grunt-contrib-imagemin#imagemin-task). Additional characteristics are:
 
* It is meant for **in-place replacement** of images with their minified versions.
* It is saving a **backup copy** of all original images.
* It is **tracking previous minifications** to minify only those images that have changed since the last run.


## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-imagemin-backup --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-imagemin-backup');
```

## The "imageminbackup" task

### Overview
In your project's Gruntfile, add a section named `imageminbackup` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  imageminbackup: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### Base options

*grunt-imagemin-backup* uses the same configuration options as the original *grunt-contrib-imagemin* task. For details on these options, please see their respective documentation:

* [optimizationLevel (png)](https://github.com/gruntjs/grunt-contrib-imagemin#optimizationlevel-png)
* [progressive (jpg)](https://github.com/gruntjs/grunt-contrib-imagemin#progressive-jpg)
* [interlaced (gif)](https://github.com/gruntjs/grunt-contrib-imagemin#interlaced-gif)
* [svgoPlugins (svg)](https://github.com/gruntjs/grunt-contrib-imagemin#-svgoplugins-svg)
* [usel (png)](https://github.com/gruntjs/grunt-contrib-imagemin#use)

#### options.backup
Type: `String`
Default value: None

The directory that should be used as the base directory for image backup copies. The source images and their directory structures will be copied here recursively.


### Usage Example

In this example, the backup directory is set to `.backup` (must exist prior to running this task). The task will find all PNG, JPEG, GIF and SVG images below `path/to/assets`, minify them and save a backup copy of each to the corresponding location under `.backup` (directories will be created as necessary).

```js
var mozjpeg                 = require('imagemin-mozjpeg');

grunt.initConfig({
  imageminbackup : {
    images: {
      options: {

        // Image format specific options, see grunt-contrib-imagemin
        optimizationLevel   : 3,
        progressive         : true,
        interlaced          : true,
        svgoPlugins         : [{removeViewBox: false}],
        use                 : [mozjpeg()],

        // Backup directory
        backup              : '.backup'
      },
      files: [{
        expand              : true,
        cwd                 : 'path/to/assets/',
        src                 : ['**/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF}'],
        dest                : 'path/to/assets/'
      }]
    }
  }
});
```

#### Minification history
*grunt-imagemin-backup* uses an [sqlite3](https://www.npmjs.com/package/sqlite3) database for storing information about previous minifactions runs. If you, for whatever reason, need to reset this database, you may simply delete the file `<project-root>/node_modules/grunt-imagemin-backup/cache.db`.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release history
Please refer to the [changelog](CHANGELOG.md) for a complete release history.

# Legal
Copyright © 2015 Joschi Kuphal <joschi@kuphal.net> / [@jkphl](https://twitter.com/jkphl). *grunt-imagemin-backup* is licensed under the terms of the [MIT license](LICENSE.txt).