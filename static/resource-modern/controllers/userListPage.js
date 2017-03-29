import React from 'React'
import ReactDom from 'ReactDom'
import pageView from 'BaseView'

var View = pageView.extend({
	events:{
		
	},
	onCreate:function(){

	},
	onShow:function(){

	},	
	getUserList: function() {
		$.ajax({
			type:"get",
			url:"/getUsers",
			dataType:"json",
			data:obj,
			success:function(data){
				console.log(data);
			},
			error:function(){

			}
		});

	}
});
export default View;
