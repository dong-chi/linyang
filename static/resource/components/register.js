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

	function _objectWithoutProperties(obj, keys) {
		var target = {};

		for (var i in obj) {
			if (keys.indexOf(i) >= 0) continue;
			if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
			target[i] = obj[i];
		}

		return target;
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

	var Registered = function (_React$Component) {
		_inherits(Registered, _React$Component);

		function Registered(props) {
			_classCallCheck(this, Registered);

			var _this = _possibleConstructorReturn(this, (Registered.__proto__ || Object.getPrototypeOf(Registered)).call(this, props));

			//let {...props} = props.opts;
			//departInfo:部门信息数组
			//userInfo:用户信息
			//defaultInfo:初始注册用户信息
			//editUserInfo:编辑中的用户信息
			//isLoadingUser是否加载用户信息
			_this.state = {
				departInfo: {
					name: "",
					password: "",
					departid: 0,
					sex: 0,
					phone: ""
				}
			};
			return _this;
		}

		_createClass(Registered, [{
			key: 'render',
			value: function render() {
				var props = _objectWithoutProperties(this.props.opts, []);

				return _React2.default.createElement(
					'div',
					{ className: 'container' },
					_React2.default.createElement(
						'div',
						{ className: 'row' },
						_React2.default.createElement(
							'div',
							{ className: 'col-md-4 col-md-offset-4' },
							_React2.default.createElement(
								'form',
								{ className: 'form-horizontal' },
								_React2.default.createElement(
									'h2',
									null,
									'\u6CE8\u518C\u4EBA\u5458\u4FE1\u606F'
								),
								_React2.default.createElement(
									'div',
									{ className: 'form-group' },
									_React2.default.createElement(
										'label',
										{ className: 'col-sm-3 control-label' },
										'\u59D3\u540D'
									),
									_React2.default.createElement(
										'div',
										{ className: 'col-sm-9' },
										_React2.default.createElement('input', { type: 'text', value: props.name, className: 'form-control', placeholder: '\u8F93\u5165\u59D3\u540D' })
									)
								),
								_React2.default.createElement(
									'div',
									{ className: 'form-group' },
									_React2.default.createElement(
										'label',
										{ className: 'col-sm-3 control-label' },
										'\u6635\u79F0'
									),
									_React2.default.createElement(
										'div',
										{ className: 'col-sm-9' },
										_React2.default.createElement('input', { type: 'text', value: props.pname, className: 'form-control', placeholder: '\u8F93\u5165\u59D3\u540D' })
									)
								),
								_React2.default.createElement(
									'div',
									{ className: 'form-group' },
									_React2.default.createElement(
										'label',
										{ className: 'col-sm-3 control-label' },
										'\u5BC6\u7801'
									),
									_React2.default.createElement(
										'div',
										{ className: 'col-sm-9' },
										_React2.default.createElement('input', { type: 'password', value: props.password, className: 'form-control', placeholder: '\u8F93\u5165\u5BC6\u7801' })
									)
								),
								_React2.default.createElement(
									'div',
									{ className: 'form-group' },
									_React2.default.createElement(
										'label',
										{ className: 'col-sm-3 control-label' },
										'\u6240\u5C5E\u90E8\u95E8'
									),
									_React2.default.createElement(
										'div',
										{ className: 'col-sm-9' },
										_React2.default.createElement(
											'select',
											{ className: 'form-control' },
											_React2.default.createElement(
												'option',
												{ value: '0' },
												'--\u9009\u62E9\u90E8\u95E8--'
											),
											props.departInfo.map(function (val) {
												return _React2.default.createElement(
													'option',
													{ value: val.DepartId },
													val.DepartName
												);
											})
										)
									)
								),
								_React2.default.createElement(
									'div',
									{ className: 'form-group' },
									_React2.default.createElement(
										'label',
										{ className: 'col-sm-3 control-label' },
										'\u6027\u522B'
									),
									_React2.default.createElement(
										'div',
										{ className: 'col-sm-9' },
										_React2.default.createElement(
											'select',
											{ className: 'form-control' },
											_React2.default.createElement(
												'option',
												null,
												'--\u9009\u62E9\u6027\u522B--'
											),
											_React2.default.createElement(
												'option',
												null,
												'\u7537'
											),
											_React2.default.createElement(
												'option',
												{ select: true },
												'\u5973'
											)
										)
									)
								),
								_React2.default.createElement(
									'div',
									{ className: 'form-group' },
									_React2.default.createElement(
										'label',
										{ className: 'col-sm-3 control-label' },
										'\u8054\u7CFB\u7535\u8BDD'
									),
									_React2.default.createElement(
										'div',
										{ className: 'col-sm-9' },
										_React2.default.createElement('input', { type: 'password', value: props.phone, className: 'form-control', placeholder: '\u8F93\u5165\u8054\u7CFB\u7535\u8BDD' })
									)
								),
								_React2.default.createElement(
									'div',
									{ className: 'form-group' },
									_React2.default.createElement(
										'div',
										{ className: 'col-md-2 col-md-offset-4' },
										_React2.default.createElement(
											'a',
											{ className: 'btn btn-primary btn-save-user', href: 'javascript:;', role: 'button' },
											'\u4FDD\u5B58'
										)
									)
								)
							)
						)
					)
				);
			}
		}]);

		return Registered;
	}(_React2.default.Component);

	exports.default = {
		renderComponent: function renderComponent(opts, element, callback) {
			return _ReactDom2.default.render(_React2.default.createElement(Registered, { opts: opts
			}), element, function () {
				callback && callback();
			});
		}
	};
	module.exports = exports['default'];
});