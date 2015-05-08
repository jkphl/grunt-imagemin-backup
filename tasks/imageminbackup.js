'use strict';
var fs				= require('fs-extra');
var os				= require('os');
var path			= require('path');
var async			= require('async');
var chalk			= require('chalk');
var prettyBytes		= require('pretty-bytes');
var Imagemin		= require('imagemin');
var rename			= require('gulp-rename');
var sqlite3			= require('sqlite3').verbose();
var crypto			= require('crypto');

/*
 * grunt-imagemin-backup
 * http://gruntjs.com/
 *
 * Copyright (c) 2015 Joschi Kuphal
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
    grunt.registerMultiTask('imageminbackup', 'Minify PNG, JPEG, GIF and SVG images while keeping a backup copy of the original files', function () {
        var done				= this.async();
        var files				= this.files;
        var totalSaved			= 0;
        var minified			= 0;
        var options				= this.options({
            interlaced			: true,
            optimizationLevel	: 3,
            progressive			: true
        });
        
		// Validate the backup directory
        var backup				= ('backup' in options) ? path.resolve(options.backup) : null;
        if (backup) {
        	fs.mkdirsSync(backup);
        }
        if (!backup || !fs.existsSync(backup)) {
        	grunt.fail.warn('No or invalid backup directory specified!', 6);
        }
        
        // Prepare the SQLite database
        var dbfile				= path.join(__dirname, '..', 'cache.db');
        var exists				= fs.existsSync(dbfile);
        var db					= new sqlite3.Database(dbfile);
        
		db.serialize(function() {
			if (!exists) {
				db.run('CREATE TABLE modifications (file TEXT PRIMARY KEY, tstamp INT)');
			}
		});
        
        async.eachLimit(files, os.cpus().length, function (file, next) {
            var msg;
            var imagemin		= new Imagemin()
				                .src(file.src[0])
				                .dest(path.dirname(file.dest))
				                .use(Imagemin.jpegtran(options))
				                .use(Imagemin.gifsicle(options))
				                .use(Imagemin.optipng(options))
				                .use(Imagemin.svgo({plugins: options.svgoPlugins || []}));

            if (options.use) {
                options.use.forEach(imagemin.use.bind(imagemin));
            }

            if (path.basename(file.src[0]) !== path.basename(file.dest)) {
                imagemin.use(rename(path.basename(file.dest)));
            }
            
            fs.stat(file.src[0], function (err, stats) {
                if (err) {
                    grunt.warn(err + ' in file ' + file.src[0]);
                    return next();
                }
                
                var hash		= crypto.createHash('md5').update(file.dest).digest('hex');
                
               	db.get('SELECT * FROM modifications WHERE file = ?', [hash], function(err, row){

               		// If an error occured
               		if (err) {
               			grunt.warn(err + ' in file ' + file.src[0]);
               			return next();
               		}
               		
               		// If the file is already registered
               		if (row) {
               			
               			// Check if the target file already exists and compare its modification date and time with the recorded one
               			var destStats	= fs.statSync(file.dest);
               			if (destStats && (row.tstamp >= destStats.mtime.getTime())) {
	               			grunt.verbose.writeln(chalk.green('✔ ') + file.src[0] + chalk.gray(' (no changes)'));
	               			return next();
               			}
               		}
               		
               		// If the file should be backed up before processing
               		if (file.src[0] == file.dest) {
               			fs.copySync(file.src[0], path.join(backup, file.src[0]));
               			grunt.verbose.writeln(chalk.green('✔ ') + file.src[0] + ' backed up');
               		}

               		imagemin.run(function (err, data) {
	                    if (err) {
	                        grunt.warn(err + ' in file ' + file.src[0]);
	                        return next();
	                    }
	
	                    var origSize = stats.size;
	                    var diffSize = origSize - data[0].contents.length;
						++minified;
	                    totalSaved += diffSize;
	
	                    if (diffSize < 10) {
	                        msg = 'already optimized';
	                    } else {
	                        msg = [
	                            'saved ' + prettyBytes(diffSize) + ' -',
	                            (diffSize / origSize * 100).toFixed() + '%'
	                        ].join(' ');
	                    }
	                    
	                    var diffStats = fs.statSync(file.dest);
	                    if (row) {
	                    	db.run('UPDATE modifications SET tstamp = ? WHERE file = ?', [diffStats.mtime.getTime(), hash]);
	                    } else {
	                    	db.run('INSERT INTO modifications (tstamp, file) VALUES (?, ?)', [diffStats.mtime.getTime(), hash]);
	                    }
	
	                    grunt.log.writeln(chalk.green('✔ ') + file.src[0] + chalk.gray(' (' + msg + ')'));
	                    process.nextTick(next);
	                });
               	});
            });
        }, function (err) {
            if (err) {
                grunt.warn(err);
            }

            var msg = [
                'Minified ' + minified,
                minified === 1 ? 'image' : 'images',
                chalk.gray('(saved ' + prettyBytes(totalSaved) + ')')
            ].join(' ');

            grunt.log.writeln(msg);
            done();
        });
    });
};
