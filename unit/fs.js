// filesystem with promise
var fs = require('fs')
var fse = require('fs-extra')

var readdir = exports.readdir = function(dirpath) {
    return new Promise(function(resolve, reject) {
        fs.readdir(dirpath, function(err, files) {
            err ? reject(err) : resolve(files)
        })
    })
}

var readFile = exports.readFile  = function(filePath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath, function(err, data) {
            err ? reject(err) : resolve(data.toString())
        })
    })
}

var writeFile = exports.writeFile  = function(file, data, options) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(file, data, options, function(err, data) {
            err ? reject(err) : resolve(data)
        })
    })
}

var stat = exports.stat = function(filepath) {
    return new Promise(function(resolve, reject) {
        fs.stat(filepath, function(err, stats) {
            err ? reject(err) : resolve(stats)
        })
    })
}

var mkdirs = exports.mkdirs = function(dirname) {
    return new Promise((resolve, reject) => {
        fse.mkdirs(dirname, error => {
            !error ? resolve() : reject()
        })
    })
}

var walk = exports.walk = function(dirname) {
    return new Promise((resolve, reject) => {
        var items = []
        fse.walk(dirname)
        .on('data', item => items.push(item.path))
        .on('end', resolve.bind(null, items))
        .on('error', reject)
    })
}

var ensureFile = exports.ensureFile = function(file) {
    return new Promise((resolve, reject) => {
        fse.ensureFile(file, error => {
            !error ? resolve() : reject()
        })
    })
}