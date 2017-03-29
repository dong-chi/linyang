define(['module', 'exports', 'React', 'ReactDom', 'BaseView', 'LeftTreeCom'], function (module, exports, _React, _ReactDom, _BaseView, _LeftTreeCom) {
	

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _React2 = _interopRequireDefault(_React);

	var _ReactDom2 = _interopRequireDefault(_ReactDom);

	var _BaseView2 = _interopRequireDefault(_BaseView);

	var _LeftTreeCom2 = _interopRequireDefault(_LeftTreeCom);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var View = _BaseView2.default.extend({
		events: {
			'click .bot': 'firstClick'
		},
		onCreate: function onCreate() {},
		onShow: function onShow() {
			document.title = "哈哈哈哈哈";

			_LeftTreeCom2.default.renderComponent({}, document.getElementById(this.id));

			this.$el.append('<p><div class="bot">点击我</div></p>');
		},
		firstClick: function firstClick() {
			console.log("xxxxxxxxxx");
			alros.goTo("/loginIndex");
		}
	});
	exports.default = View;
	module.exports = exports['default'];
});