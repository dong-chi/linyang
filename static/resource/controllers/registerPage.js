define(['module', 'exports', 'React', 'ReactDom', 'BaseView', 'register'], function (module, exports, _React, _ReactDom, _BaseView, _register) {
	

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _React2 = _interopRequireDefault(_React);

	var _ReactDom2 = _interopRequireDefault(_ReactDom);

	var _BaseView2 = _interopRequireDefault(_BaseView);

	var _register2 = _interopRequireDefault(_register);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var View = _BaseView2.default.extend({
		tourViewName: 'registerPage',
		events: {
			'click .black': 'goBack',
			'click .btn-save-user': 'btnSave'
		},
		onCreate: function onCreate() {},
		onShow: function onShow() {
			document.title = "新增用户";
			this.defaultInfo = {
				name: "",
				password: "",
				departid: 0,
				sex: 0,
				phone: ""
			};
			this.showPage();
			//regCom.renderComponent({},document.getElementById(this.id));
		},
		goBack: function goBack() {
			alros.goBack();
		},
		showPage: function showPage() {
			var self = this;
			$.ajax({
				type: "GET",
				url: "/getDepartInfo",
				dataType: "json",
				success: function success(data) {
					if (data && data.length > 0) {
						self.defaultInfo.departInfo = data;
						_register2.default.renderComponent(self.defaultInfo, document.getElementById(self.id));
					} else {
						alert("部门信息获取失败");
					}
				},
				error: function error() {}
			});
		},
		btnSave: function btnSave() {

			$.ajax({
				type: "POST",
				url: "/registered",
				dataType: "json",
				data: obj,
				success: function success(data) {
					console.log(data);
				},
				error: function error() {}
			});
		}
	});
	exports.default = View;
	module.exports = exports['default'];
});