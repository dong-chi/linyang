
require.config({
	paths: {
		"R": "src/base/require",
		"$": "src/base/zepto",
		"_": "src/base/underscore",
		"B": "src/base/Backbone",
		"libs" :"src/base/libs",
		"inherit": "src/common/inherit",
		"pageview": "src/page/pageview",
		"pageparser": "src/common/page.parser",
		"pagedefault":"src/common/page.default",
		"pageroute":"src/common/route",
		"utilPath":"src/util/util.path"

	},
	shim: {
		$: {
			exports: 'Zepto'
		},
		_: {
			exports: '_'
		},
		B: {
			deps: ['_', '$'],
			exports: 'Backbone'
		}
	}
})
// require.config({
// 	paths:{
// 		"inherit": "./src/common/inherit"
// 	}
// })