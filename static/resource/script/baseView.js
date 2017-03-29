define(["pageview"],function(pageView){
	var BaseView = pageView.extend({
		initialize: function () {
			var superclass = BaseView.__super__.initialize.apply(this, arguments);
		},
		show:function(){
			var superclass = BaseView.__super__.show.apply(this, arguments);
		}
	});
	return BaseView;
})