var gulp = require('gulp')
var babel = require("gulp-babel")
var path = require('path')
var plumber = require('gulp-plumber')
var replace = require('gulp-replace')
//var eslint = require('gulp-eslint')
var colors = require('colors/safe')
var optimize = require('gulp-requirejs-optimize') 
var amdOptimize = require("amd-optimize");  
var concatFile = require('gulp-concat')
var rename = require('gulp-rename')  

var babelConfig = {
  "presets": ["react", "es2015", "stage-0"],
  "plugins": [
    "syntax-export-extensions",
    "babel-plugin-add-module-exports",
    "transform-es2015-modules-amd"
  ],
  "compact": false,
}

var from = path.join(__dirname, './static/resource-modern')
var to = path.join(__dirname, './static/resource')

// 需要编译的文件
var include = path.join(from, './**/*.js')

// 需要排除编译的文件
var exclude = ['./tourconfig.js', './libs/**/*.js'].map(function(filename) {
    return path.join(from, filename)
})

var allFiles = path.join(from, './**/*')
var dest = to


var babelSrc = [include].concat(exclude.map(function(filename) {
    return `!${filename}`
}))

// 拷贝并编译所有 js 文件到 dest 目录
gulp.task('build:eslint', ['move'], function() {
    console.log('===================================starting');
    return gulp.src(babelSrc)
        .pipe(plumber())
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError())
        .pipe(babel(babelConfig))
        // babel6 强制添加 use strict 导致编译 CMD 出错，清理掉
        .pipe(replace(/'use strict';/, ''))
        .pipe(gulp.dest(dest))
})

gulp.task('build:unlint', ['move'], function() {
    return gulp.src(babelSrc)
        // .pipe(plumber())
        .pipe(babel(babelConfig))
        // babel6 强制添加 use strict 导致编译 CMD 出错，清理掉
        .pipe(replace(/'use strict';/, ''))
        .pipe(gulp.dest(dest))
})

// 拷贝所有不需要编译的文件到 dest 目录
gulp.task('move', function() {
    return gulp.src(allFiles)
        .pipe(gulp.dest(dest))
})

gulp.task('optimize', function(){
    return gulp.src("./src/**/*.js")
            .pipe(amdOptimize("test",{
                configFile:'./src/config.js'
            }))
            .pipe(concatFile('libs.js'))
            .pipe(gulp.dest('./src'));
})

gulp.task('concat', function(){
    return gulp.src(["./src/libs.js","./src/alros.seed.js"])
                .pipe(concatFile("alros.seed.build.js"))
                .pipe(gulp.dest('./src'));
})

gulp.task('mytask', ['optimize', 'concat']);


// gulp.task('watch:unlint', function() {
//     createWatcher(function(src, dest) {
//         return gulp.src(src)
//             .pipe(plumber())
//             .pipe(babel(babelConfig))
//             // babel6 强制添加 use strict 导致编译 CMD 出错，清理掉
//             .pipe(replace(/'use strict';/, ''))
//             .pipe(gulp.dest(dest))
//     })
// })

gulp.task('watch:unlint', function() {
    createWatcher(function(src, dest) {
        return gulp.src(src)
            .pipe(plumber())
            .pipe(babel(babelConfig))
            // babel6 强制添加 use strict 导致编译 CMD 出错，清理掉
            .pipe(replace(/'use strict';/, ''))
            .pipe(gulp.dest(dest))
    })
})

gulp.task('watch:eslint', function() {
    createWatcher(function(src, dest) {
        return gulp.src(src)
            .pipe(plumber())
            // eslint() attaches the lint output to the "eslint" property
            // of the file object so it can be used by other modules.
            .pipe(eslint())
            // eslint.format() outputs the lint results to the console.
            // Alternatively use eslint.formatEach() (see Docs).
            .pipe(eslint.format())
            // To have the process exit with an error code (1) on
            // lint error, return the stream and pipe to failAfterError last.
            .pipe(eslint.failAfterError())
            .pipe(babel(babelConfig))
            // babel6 强制添加 use strict 导致编译 CMD 出错，清理掉
            .pipe(replace(/'use strict';/, ''))
            .pipe(gulp.dest(dest))
    })
})

gulp.task('default', ['watch:unlint'])


var fileInfoCache = {}

function createWatcher(runTasks) {
    var watcher = gulp.watch(babelSrc)
    watcher.on('change', function(event) {
        var src = event.path
        var dest = path.dirname(event.path.replace(from, to))
        var filename = path.basename(src)
        var start = new Date()
        var startTime = colors.gray(`${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}`)
        var times = fileInfoCache[filename] = (fileInfoCache[filename] || 0) + 1
        var changeInfo = colors.yellow(`${ event.type } * ${ times }`)
        var startInfo = `[${ startTime }] File ${ colors.green(filename) } was ${ changeInfo } and is building...`
        var startInfo = 'File was building...';
        return runTasks(src, dest)
            .on('end', function() {
                var end = new Date()
                var endTime = colors.gray(`${end.getHours()}:${end.getMinutes()}:${end.getSeconds()}`)
                var duration = colors.magenta(`${end.getTime() - start.getTime()}ms`)
                var endInfo = `[${ endTime }] File ${ colors.green(filename) } was builded after ${ duration }`
                console.log(endInfo)
                var endInfo = 'File was building was builded'
            })
    })
}
