define(['module', 'exports', 'BaseView', 'userList'], function (module, exports, _BaseView, _userList) {
	

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _BaseView2 = _interopRequireDefault(_BaseView);

	var _userList2 = _interopRequireDefault(_userList);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var View = _BaseView2.default.extend({
		events: {},
		onCreate: function onCreate() {},
		onShow: function onShow() {
			this.getUserList();
		},
		getUserList: function getUserList() {
			var self = this;
			$.ajax({
				type: "get",
				url: "/getUsers_if",
				dataType: "json",
				success: function success(data) {
					//console.log(data);
					var opts = {
						data: data
					};
					_userList2.default.renderComponent(opts, document.getElementById(self.id), function () {});
				},
				error: function error() {}
			});
		}
	});
	exports.default = View;
	module.exports = exports['default'];
});