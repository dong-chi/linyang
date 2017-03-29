define(function() {
	//判断是在h5还是在hybird
	var renderAt = $('.main-viewport').attr('renderat');
	alros.renderAt = 'server';
	if (!renderAt) alros.renderAt = 'client';

	function PageView(options) {
		this.initialize(options);
	}
	PageView.subclasses = [],
		PageView.defaults = {
			"mainRoot": '#main',
			"viewport": '.main-viewport',
		}
	PageView.prototype = {
		initProperty: function(options) {
			var opts = _.extend({}, PageView.defaults, options || {});
			return opts;
		},
		initialize: function(options) {
			var opts = this.initProperty(options);
			this.options = opts;
			this.mainRoot = $(opts.mainRoot);
			this.viewport = this.mainRoot.find(opts.viewport);
			this.curView = null;
			this.lastView = null;
			this.views = {};
			this.bindEvents();
		},
		bindEvents:function(){

		},
		showView: function(e) {
            this.loadView(e.url, e.text, e.options)
        },
		loadView: function(url, html, options) {
			var pageConfig = alros._initParser(url,html);
			var renderObj = alros.render(pageConfig);
			require([renderObj.config.controller || 'cPageView'], _.bind(function(View) {
				if (_.isFunction(this.judgeForward) && !this.judgeForward(url)) {
					return;
				}
				if (this.curView) this.lastView = this.curView;
				if (renderObj.config.viewName && this.views[renderObj.config.viewName]) {
					this.curView = this.views[renderObj.config.viewName];
					if (this.curView.$el.attr('page-url') != url) {
						this.curView.$el.remove();
						this.curView.$el = $(renderObj.viewport).appendTo(this.viewport);
						this.curView.onCreate && this.curView.onCreate();
						this.curView.delegateEvents();
					}
				} else {
					this.curView = new View({
						el: (options.renderAt == 'server') ? this.viewport.children().first() : $(renderObj.viewport).appendTo(this.viewport)
					});
					this.curView.$el.attr('page-url', url);
					this.switchView(this.curView, this.lastView);
					if (renderObj.config.viewName) {
						this.views[renderObj.config.viewName] = this.curView;
					}
				}
				if (this.curView && this.curView.switchByOut){
					var self = this;
					self.lastView && self.lastView.hide();
					self.curView.$el.show();
				}
			},this))
		},
		switchView: function(inView, outView) {
			if (outView && !document.getElementById(outView.id) && (inView && !inView.switchByOut)) {
				outView.$el.appendTo(this.viewport);
				outView.$el.hide();
			}
			if (inView && !document.getElementById(inView.id)) {
				inView.$el.appendTo(this.viewport);
				inView.$el.hide();
			}
			if(outView){
				inView && !inView.switchByOut && outView.hide();
			}
			inView.show();
			//this._onSwitchEnd(inView, outView);

		},
		goTo: function (url, opt) {

      	},
		goBack: function() {

		},
		start:function(){},
		go: function() {},
		interface: function() {
			return {
				"goTo": this.goTo,
				"goBack": this.goBack,
				"forward": this.goTo,
				"back": this.goBack,
				"go": this.go,
				"start":this.start
			}
		}
	}

	return PageView;
})