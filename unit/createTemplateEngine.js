/**
 * 定制化的模板引擎
 */
var _ = require('lodash')
var path = require('path')
var pfs = require('../unit/fs')


var templateSettings = {
    interpolate: /{#=([\s\S]+?)#}/g, // 插值
    escape: /{#-([\s\S]+?)#}/g, // html 转义
    evaluate: /{#([\s\S]+?)#}/g, // 求值
}

var LOADER_RE = /@RenderPage\(["']([^"']+)["']\);?/g

/**
 * 获取模板文件里依赖的其他模板的路径
 */
function getDependencies(content) {
    var result = []
    var matches = LOADER_RE.exec(content)
    while (matches) {
        result.push(matches)
        matches = LOADER_RE.exec(content)
    }
    return result
}

function isThenable(obj) {
    return obj != null && typeof obj.then === 'function'
}

function createTemplateEngine(settingsArg) {
    var settings = settingsArg || {}
    var paths = settings.paths || {}
    var rootPath = settings.rootPath
    var layoutName = paths['layout'] || 'layout'
    var debug = settings.debug
    var defaults = settings.defaults
    var extname = settings.extname

    var layoutPath = path.join(rootPath, `${layoutName}${extname}`)
    var render = null
    var setRender = layoutContent => {
        var result = _.template(layoutContent, templateSettings)
        render = debug ? null : result
        return result
    }
    var getRender = () => {
        if (render) {
            return render
        }
        return render = pfs.readFile(layoutPath)
            .then(setRender)
    }

    var fileContents = {}
    var getContentDeep = filePath => {
        if (fileContents[filePath]) {
            return fileContents[filePath]
        }
        return fileContents[filePath] = pfs.readFile(filePath)
            .then(fileContent => {
                var dependencies = getDependencies(fileContent)
                if (dependencies.length === 0) {
                    return fileContent
                }
                var dirname = path.dirname(filePath)
                var promises = dependencies.map(dependency => {
                    var absFilePath = path.join(dirname, dependency[1].toLowerCase())
                    var dependencyContent = getContentDeep(absFilePath)
                    if (isThenable(dependencyContent)) {
                        return dependencyContent.then(dependencyContent => {
                            fileContent = fileContent.replace(dependency[0], dependencyContent)
                        })
                    } else {
                        fileContent = fileContent.replace(dependency[0], dependencyContent)
                    }
                    return dependencyContent
                })
                return Promise.all(promises).then(() => {
                    fileContents[filePath] = debug ? null : fileContent
                    return fileContent
                })
            })
    }

    return function templateEngine(originViewPath, options, callback) {
        //console.log(originViewPath);
        /**
         * originViewPath 是 express 拼接 rootPath + viewName + extName 组成的绝对地址
         * 删除后拿到 viewName，再拼接出正确的绝对地址
         */
        var viewName = originViewPath.replace(rootPath, '').replace(extname, '').replace(path.sep, '');
        
        var shouldSendFile = false
        
        if (viewName === '404' || viewName === 'debug') {
            shouldSendFile = true
            viewName = debug ? 'debug' : viewName
        }
        var filePath = path.join(rootPath, `${viewName}${extname}`)
        var data = _.extend({}, defaults, options)

        if (shouldSendFile) {
            var content = getContentDeep(filePath)
            if (isThenable(content)) {
                content.then(fileContent => {
                        if (!debug) {
                            return callback(null, fileContent)
                        }
                        var render = _.template(fileContent, templateSettings)
                        var content = render({
                            message: JSON.stringify(data, null, 2),
                        })
                        callback(null, content)
                    })
                    .catch(callback)
            } else {
                callback(null, content)
            }
            return
        }

        var renderFn = getRender()
        var content = getContentDeep(filePath)
        // content 和 renderFn 都有缓存，可同步执行
        if (!isThenable(content) && !isThenable(renderFn)) {
            data.config = _.template(content, templateSettings)(data)
            callback(null, renderFn(data))
            return
        }

        Promise.all([renderFn, content])
            .then(results => {
                var render = results[0]
                data.config = _.template(results[1], templateSettings)(data)
                callback(null, render(data))
            })
            .catch(callback)
    }
}

function delay(timeout, value) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve.bind(null, value), timeout || 1000)
    })
}

module.exports = createTemplateEngine
