(function () {
    var baseUrl = globalObj.baseUrl + "resource/";
    var config = {
        paths: {
            'React':baseUrl + 'script/libs/react',
            'ReactDom':baseUrl + 'script/libs/react-dom',
            'BaseView':baseUrl + 'script/baseView',

            //页面画图
            'LeftTree':baseUrl + 'components/leftTree',
            'userList':baseUrl + 'components/userList',
            'login':baseUrl+ 'components/login',
            'register':baseUrl+ 'components/register',

            //组件
        },
        urlArgs: 'v='+(window.ly_version || Date.now())
    };
    require.config(config);
})();
