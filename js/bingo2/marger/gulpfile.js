// npm install --save-dev gulp gulp-uglify gulp-concat
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var srcPath = 'd:/Projects/Iaas/PS/bingoJS2/js/bingo2/';
var destPath = 'd:/Projects/Iaas/PS/bingoJS2/js/bingo2/marger/build/';
var bingoPathMin = 'd:/Projects/Iaas/PS/bingoJS2/js/bingo2/marger/build/bingo.min.js';
var srcList = ['core.js', 'promise.js', 'event.js', 'observe.js',
    'package.js', 'linkNode.js', 'route.js', 'location.js', 'compiles.js',
    'service/base.js', 'command/base.js'];

srcList = srcList.map(function (item) {
    return srcPath + item;
});

gulp.task('bingojs', ['concat', 'uglify']);

gulp.task('concat', function () {
    return gulp.src(srcList)
           .pipe(concat('bingo.js'))
          .pipe(gulp.dest(destPath));
});

gulp.task('uglify', function () {
    return gulp.src(srcList)
           .pipe(concat('bingo.min.js'))
            .pipe(uglify())
          .pipe(gulp.dest(destPath));
});

