define(["inherit", "pagedefault","utilPath"], function(inherit,app,Path) {
	return inherit.Class(app, {
		bindEvents: function($super) {
			$super();
			$(window).bind('popstate', _.bind(function(e) {
				var data = e.state || (e.originalEvent && e.originalEvent.state);
				if (data.options) {
					data.options.pushState = false;
					data.options.landingpage = 0;
					data.options.hideloading = true;
				}
				// if (Lizard.stopStateWatch || !data) {
				// 	return;
				// }
				history.replaceState({
					url: data.url,
					text: data.text,
					options: data.options
				}, document.title, data.url);
				this.showView(data);
			}, this));
		},
		start: function() {
			var self = this;
			var path = Path.parseUrl(location.href).pathname;
			path = "/" == path ? "/index" : location.href.substring(location.href.indexOf(path));
			history.pushState({
				url: path,
				text: document.documentElement.innerHTML,
				options: {
					pushState: false
				}
			}, document.title, path);
			self.loadView(path, document.documentElement.innerHTML, {
				pushState: false
			});

		},
		goTo: function(url, opt) {
			var self = this;

			$.get(url, opt ? opt.data : {}, function(html) {
				history.pushState({
					url: url,
					text: html,
					options: {
						pushState: true
					}
				}, document.title, url);
				self.loadView(url, html, {
					pushState: true
				});
			});
		},
		goBack: function() {
			if (arguments.length == 0) {
				history.back()
			} else {
				this.goTo.apply(this, arguments);
			}
		},
		judgeForward: function(url) {
			var parseResult = Path.parseUrl(window.location.protocol + '//' + window.location.host + (url.indexOf('/') == 0 ? url : '/' + url)),
				reg = new RegExp(parseResult.pathname + "$");
			return reg.test(window.location.pathname);
		}
	});
})