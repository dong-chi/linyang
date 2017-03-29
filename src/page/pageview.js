define(['libs'],function(libs) {
	var PageView = Backbone.View.extend({
		initialize: function() {
			this.id = this.$el.attr("id");
			this.create();
			this.triggerShow = true;
			this.triggerHide = true;
			this.switchByOut = false;
		},
		create: function() {
			//调用子类onCreate
			this.onCreate && this.onCreate();
		},
		destroy: function() {
			this.$el.remove();
		},
		show: function() {
			// fix ios 页面切换键盘不消失的bug
			document.activeElement && document.activeElement.blur();
			
			//调用子类onShow方法
			this.switchByOut && this.$el.show();

			this.triggerShow && this.onShow && this.onShow();


			this.triggerShow = true;
			this.triggerHide = true;
			this.switchByOut = true;
		},
		/**
		 * View 隐藏
		 * @method View.cPageView.onHide
		 */
		hide: function() {
			//调用子类onHide方法
			this.triggerHide && this.onHide && this.onHide();
			this.removeScrollListener && this.removeScrollListener();
			this.$el.hide();
		},
	});
	return PageView;
})