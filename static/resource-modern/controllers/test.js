import React from 'React'
import ReactDom from 'ReactDom'
import pageView from 'BaseView'
import LeftTree from 'LeftTreeCom'

var View = pageView.extend({
	events:{
		'click .bot':'firstClick'
	},
	onCreate:function(){

	},
	onShow:function(){
		document.title = "哈哈哈哈哈";

		LeftTree.renderComponent({},document.getElementById(this.id));

		this.$el.append('<p><div class="bot">点击我</div></p>');
	},
	firstClick:function(){
		console.log("xxxxxxxxxx");
		alros.goTo("/loginIndex");
	}
});
export default View;
