define(["inherit"], function() {
	var uuid = 0;
	var pageDocNode = null;

	function getID(url) {
		var id = "client_id_viewport_" + (++uuid) + "_" + (new Date().getTime());
		return id;
	};
	alros._initParser = function(url, html) {
		pageDocNode = $('<DIV>' + html + '</DIV>');
		var pageConfig = getPageConfig();
		pageConfig.pageUrl = url;
		return pageConfig;
	}
	alros.render = function(pageConfig) {
		// if (Lizard.__fakeViewnode) {
		//   Lizard.__fakeViewnode.remove();
		// }
		var ret = {
			header: '',
			viewport: ''
		};
		var id = getID(pageConfig.pageUrl);

		ret.viewport = ['<div id="', id, '" page-url="', pageConfig.pageUrl, '">', ret.viewport, '</div>'].join('').trim();
		ret.id = id;
		ret.controller = pageConfig.controller;
		ret.config = pageConfig;
		return ret;
	}

	function getPageConfig() {
		var configStr = getPageConfigStr();
		//var dataexpr = ParseUtil.parseDepend(configStr), ret = {};
		eval('ret = ' + configStr);
		if (!ret.viewName) {
			if (ret.controller) {
				var viewName = ret.controller.substring(ret.controller.lastIndexOf('/') + 1);
				ret.viewName = viewName.substring(0, viewName.indexOf('.'));
			} else {
				ret.viewName = 'emptyName';
			}
		}
		//ret.dataexpr = dataexpr;
		return ret;
	}

	function getPageConfigStr() {
		var configStr = pageDocNode.find('script[type="text/lizard-config"]').text();
		if (!configStr) {
			configStr = '{"url_schema": "","model": {"apis": []},"view":{}}';
		}
		return configStr;
	}
})