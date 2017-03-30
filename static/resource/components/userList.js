define(['module', 'exports', 'React', 'ReactDom'], function (module, exports, _React, _ReactDom) {
	

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _React2 = _interopRequireDefault(_React);

	var _ReactDom2 = _interopRequireDefault(_ReactDom);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	var UserList = function (_React$Component) {
		_inherits(UserList, _React$Component);

		function UserList(props) {
			_classCallCheck(this, UserList);

			return _possibleConstructorReturn(this, (UserList.__proto__ || Object.getPrototypeOf(UserList)).call(this, props));
		}

		_createClass(UserList, [{
			key: 'render',
			value: function render() {
				var data = this.props.opts.data;

				return _React2.default.createElement(
					'div',
					{ className: 'container' },
					_React2.default.createElement(
						'div',
						{ className: 'row' },
						_React2.default.createElement(
							'div',
							{ className: 'col-xs-1 col-md-1 tabBorder' },
							'\u5E8F\u53F7'
						),
						_React2.default.createElement(
							'div',
							{ className: 'col-xs-2 col-md-2 tabBorder' },
							'\u59D3\u540D'
						),
						_React2.default.createElement(
							'div',
							{ className: 'col-xs-2 col-md-2 tabBorder' },
							'\u6240\u5C5E\u90E8\u95E8'
						),
						_React2.default.createElement(
							'div',
							{ className: 'col-xs-1 col-md-1 tabBorder' },
							'\u6027\u522B'
						),
						_React2.default.createElement(
							'div',
							{ className: 'col-xs-2 col-md-2 tabBorder' },
							'\u7535\u8BDD'
						),
						_React2.default.createElement(
							'div',
							{ className: 'col-xs-2 col-md-2 tabBorder' },
							'\u6CE8\u518C\u65E5\u671F'
						),
						_React2.default.createElement(
							'div',
							{ className: 'col-xs-2 col-md-2 tabBorder' },
							'\u66F4\u65B0\u65E5\u671F'
						)
					),
					data.map(function (val, key) {
						return _React2.default.createElement(
							'div',
							{ className: 'row', key: key },
							_React2.default.createElement(
								'div',
								{ className: 'col-xs-1 col-md-1 tabBorder' },
								key
							),
							_React2.default.createElement(
								'div',
								{ className: 'col-xs-2 col-md-2 tabBorder' },
								val.UserName
							),
							_React2.default.createElement(
								'div',
								{ className: 'col-xs-2 col-md-2 tabBorder' },
								val.UserName
							),
							_React2.default.createElement(
								'div',
								{ className: 'col-xs-1 col-md-1 tabBorder' },
								val.Sex
							),
							_React2.default.createElement(
								'div',
								{ className: 'col-xs-2 col-md-2 tabBorder' },
								val.Phone
							),
							_React2.default.createElement(
								'div',
								{ className: 'col-xs-2 col-md-2 tabBorder' },
								val.AddDate
							),
							_React2.default.createElement(
								'div',
								{ className: 'col-xs-2 col-md-2 tabBorder' },
								val.EditDate
							)
						);
					})
				);
			}
		}]);

		return UserList;
	}(_React2.default.Component);

	exports.default = {
		renderComponent: function renderComponent(opts, element, callback) {
			return _ReactDom2.default.render(_React2.default.createElement(UserList, { opts: opts }), element, function () {
				callback && callback();
			});
		}
	};
	module.exports = exports['default'];
});