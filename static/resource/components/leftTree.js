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

	var LeftTree = function (_React$Component) {
		_inherits(LeftTree, _React$Component);

		function LeftTree(props) {
			_classCallCheck(this, LeftTree);

			return _possibleConstructorReturn(this, (LeftTree.__proto__ || Object.getPrototypeOf(LeftTree)).call(this, props));
		}

		_createClass(LeftTree, [{
			key: 'render',
			value: function render() {
				return _React2.default.createElement(
					'ul',
					null,
					_React2.default.createElement(
						'li',
						null,
						'1'
					),
					_React2.default.createElement(
						'li',
						null,
						'2'
					),
					_React2.default.createElement(
						'li',
						null,
						'3'
					),
					_React2.default.createElement(
						'li',
						null,
						'4'
					),
					_React2.default.createElement(
						'li',
						null,
						'5'
					)
				);
			}
		}]);

		return LeftTree;
	}(_React2.default.Component);

	exports.default = {
		renderComponent: function renderComponent(opts, element, callback) {
			return _ReactDom2.default.render(_React2.default.createElement(LeftTree, { opts: opts }), element, function () {
				callback && callback();
			});
		}
	};
	module.exports = exports['default'];
});