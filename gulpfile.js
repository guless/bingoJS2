// npm install --save-dev gulp gulp-uglify gulp-concat
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var srcPath = __dirname + '/src',
    distPath = __dirname + '/dist',
    bgSrcPath = srcPath + '/scripts/bingo2',
    buildPath = distPath + "/scripts";

console.log(__dirname);
console.log(bgSrcPath);
console.log(buildPath);

var srcList = ['core.js', 'promise.js', 'event.js', 'observe.js',
    'package.js', 'linkNode.js', 'route.js', 'location.js', 'compiles.js',
    'service/base.js', 'command/base.js'];

srcList = srcList.map(function (item) {
    return [bgSrcPath , item].join('/');
});

gulp.task('bingojs', ['concat', 'uglify']);

gulp.task('concat', function () {
    return gulp.src(srcList)
           .pipe(concat('bingo.js'))
          .pipe(gulp.dest(buildPath));
});

gulp.task('uglify', function () {
    return gulp.src(srcList)
           .pipe(concat('bingo.min.js'))
            .pipe(uglify())
          .pipe(gulp.dest(buildPath));
});

