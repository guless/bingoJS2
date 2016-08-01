﻿// npm install --save-dev gulp gulp-uglify gulp-concat yargs gulp-changed gulp-plumber browser-sync gulp-clean
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var yargs = require('yargs').argv;
var browserSync = require('browser-sync');
var gulpSequence = require('gulp-sequence');

var srcPath = __dirname + '/src',
    distPath = __dirname + '/dist',
    bgSrcPath = srcPath + '/scripts/bingo2',
    buildPath = distPath + "/scripts/bingo2";

var srcList = ['core.js', 'promise.js', 'event.js', 'observe.js',
    'package.js', 'route.js', 'compiles.js',
    'service/base.js', 'command/base.js', 'attrs/base.js'];
//var srcList = ['core.js', 'promise.js', 'event.js', 'observe.js',
//    'package.js', 'linkNode.js', 'route.js', 'location.js', 'compiles.js',
//    'service/base.js', 'command/base.js', 'attrs/base.js'];

srcList = srcList.map(function (item) {
    return [bgSrcPath , item].join('/');
});

gulp.task('build', gulpSequence('clean', 'build:start'));

gulp.task('clean', function () {
    return gulp.src(distPath)
        .pipe(clean());
});

gulp.task('build:start', gulpSequence(['build:concat', 'build:copy'], 'build:uglify'));

gulp.task('build:bingojs', function (cp) { gulpSequence('build:concat', 'build:uglify')(cp); });

gulp.task('build:concat', function () {
    return gulp.src(srcList)
        .pipe(plumber())
        .pipe(concat('bingo.js'))
        .pipe(gulp.dest(buildPath));
});

gulp.task('build:uglify', function () {
    return gulp.src(srcList)
        .pipe(plumber())
        .pipe(concat('bingo.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(buildPath))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build:copy', function () {
    return gulp.src(['src/**', '!src/scripts/bingo2/**'])
        .pipe(plumber())
        .pipe(changed(distPath))
        .pipe(gulp.dest(distPath))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('watch', function () {
    gulp.watch(['src/**', '!src/scripts/bingo2/**'], ['build:copy']);
    gulp.watch('src/scripts/bingo2/**', ['build:bingojs']);
});

gulp.task('server', function () {
    yargs.p = yargs.p || 8080;
    var index = yargs.n ? '/demo/test.html' : (yargs.t ? '/jasmine/core.html' : '/index.html');
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        open: "external",
        //startPath: '/demo/box.html'
        startPath: index
    });
});

// 参数说明
//  -w: 实时监听
//  -s: 启动服务器
//  -p: 服务器启动端口，默认8080
gulp.task('default', ['build'], function () {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});
//gulp.task('default', function () {
//    if (yargs.s) {
//        gulp.start('server');
//    }

//    if (yargs.w) {
//        gulp.start('watch');
//    }
//});