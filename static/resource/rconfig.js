(function () {
    var baseUrl = globalObj.baseUrl + "resource/";
    var config = {
        paths: {
            'React':baseUrl + 'script/libs/react',
            'ReactDom':baseUrl + 'script/libs/react-dom',
            'BaseView':baseUrl + 'script/baseView',

            //组件
            'LeftTreeCom':baseUrl + 'components/leftTree',
            'loginCom':baseUrl+ 'script/componentList/loginCom',
            'regCom':baseUrl+ 'script/componentList/regCom'
        },
        urlArgs: 'v='+(window.ly_version || Date.now())
    };
    require.config(config);
})();
