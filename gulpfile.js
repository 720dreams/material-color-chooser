/*global -$ */
'use strict';
// generated on 2015-04-06 using generator-gulp-webapp 0.3.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var htmlhint = require('gulp-htmlhint');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var encodeReplace = require('gulp-encode-href-replace');

gulp.task('styles', function () {
    return gulp.src('app/styles/main.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            outputStyle: 'nested', // libsass doesn't support expanded yet
            precision: 10,
            includePaths: ['.'],
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe($.postcss([
            require('autoprefixer-core')({browsers: ['last 1 version']})
        ]))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(reload({stream: true}));
});

gulp.task('jshint', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe(reload({stream: true, once: true}))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('html', ['styles'], function () {
    var assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
        .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{cleanupIDs: false}]
        }))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
    return gulp.src(require('main-bower-files')({
        filter: '**/*.{eot,svg,ttf,woff,woff2}'
    }).concat('app/fonts/**/*'))
        .pipe(gulp.dest('.tmp/fonts'))
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
    return gulp.src([
        'app/*.*',
        'app/CNAME',
        'README.md',
        '!app/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'fonts'], function () {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['.tmp', 'app'],
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });

    // watch for changes
    gulp.watch([
        'app/*.html',
        'app/scripts/**/*.js',
        'app/images/**/*',
        '.tmp/fonts/**/*'
    ]).on('change', reload);

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            exclude: ['bootstrap-sass-official'],
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});

// https://github.com/bezoerb/gulp-htmlhint
gulp.task('validate', ['jshint'], function () {
    gulp.src('./app/*.html')
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
});

gulp.task('revision', [], function () {
    return gulp.src(['dist/**/*.css', 'dist/**/*.js', 'dist/**/*.jpg', 'dist/**/*.png', 'dist/**/*.svg'])
        .pipe(rev())
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist'))
})

gulp.task('revreplace', ['revision'], function () {
    var manifest = gulp.src('./dist/rev-manifest.json');

    return gulp.src('dist/*.html')
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest('dist'));
});

gulp.task('encodeReplace', [], function () {
    return gulp.src('dist/*.html')
        .pipe(encodeReplace())
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['validate', 'html', 'images', 'fonts', 'extras'], function () {
    gulp.start('revreplace');
    gulp.start('encodeReplace');
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});