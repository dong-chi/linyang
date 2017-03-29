
(function() {
    define("$", function () {});
    alros = typeof alros != "undefined" ? alros :{};
    window.alros = alros;
    //initLizardConfig
    function initScriptConfig() {
        var scripts = document.getElementsByTagName('script') || [];
        var reg = /alros\.seed\.(build\.|beta\.|beta.src\.|src\.|\b)*js.*$/ig;
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute("src");
            if (src && reg.test(src)) {
                alros.dir = src.replace(reg, '');
                var configStr = scripts[i].getAttribute("pdConfig") || '';
                alros.pdConfig = JSON.parse('["' + configStr.split(',').join('","') + '"]');
                alros.pdConfig && require(alros.pdConfig, function() {});
            }
        }
    }
    initScriptConfig();
    //alros.dir,alros.pdConfig;
    if (document.getElementsByClassName('main-viewport')[0]) {
        getRenderAttr();
    } else {
        $(document).ready(getRenderAttr);
    }
    //加载资源文件
    function getRenderAttr() {
        amdLoaderLoaded();
    }

    function amdLoaderLoaded() {
        require(['pageparser'],function(){
            var pageConfig = alros._initParser(location.href, document.body.innerHTML);
            var renderObj = alros.render(pageConfig);

            //
            //绑定
            require(['pageroute'],function(pageroute){
                alros.instance = new pageroute({});
                for (var i in alros.instance["interface"]()){
                    alros[i] = $.proxy(alros.instance["interface"]()[i], alros.instance);
                }
                alros.start();
                //$(renderObj.viewport).prependTo($('#main').find('.main-viewport'));

                //initAppByPackaged(pageConfig);
            })
        });
        
    }

    function initAppByPackaged(pageConfig) {
        require([pageConfig.controller || 'cPageView'], function(View) {
            if ($('#main').find('.main-viewport').children().length) {
                var view = new View({
                    el: $('#main').find('.main-viewport').children().first()
                });
                alros.instance.curView = view;
                view.show();
            }
        });
    }

    function loadScript(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.onload = callback;
        script.src = url;
        document.head.appendChild(script);
    }
})()