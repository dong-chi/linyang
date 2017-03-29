var router = require('express').Router()

// 创建 route 的工具方法
var createRoute = route => {
    router[route.type.toLowerCase()].apply(router, [route.path].concat(route.controller))
}

/* 匹配主页和 /tour */
createRoute({
    type: 'get', // get 请求
    path: '/',
    controller: function(req, res) {
        res.render('test');
    },
})

/* 匹配所有其他页面 */
createRoute({
    type: 'get',
    path: '/:page',
    controller: function(req, res) {
        var viewName = req.params.page.toLowerCase();
        //console.log(viewName);
        res.render(viewName)
    },
})

module.exports = router