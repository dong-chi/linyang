import React from 'React'
import ReactDom from 'ReactDom'
import pageView from 'BaseView'

import loginCom from 'loginCom'
import regCom from 'regCom'

var View = pageView.extend({
	events:{
		'click .black':'goBack',
		'click .login' :'login'
	},
	onCreate:function(){

	},
	onShow:function(){
		regCom.renderComponent({},document.getElementById(this.id));
		this.$el.append('<p><div class="info">显示信息的地方</div></p><div class="login">注册</div><div class="black">回退吧</div></p>');
	},
	goBack:function(){
		console.log("xxxxxxxxxx");
		alros.goBack();
	},	
	login: function() {
		let obj= {
			name:"admin",
			word:"admin"
		}
		// fetch('/registered', { // url: fetch事实标准中可以通过Request相关api进行设置
		// 	method: 'POST',
		// 	mode: 'same-origin', // same-origin|no-cors（默认）|cors
		// 	//credentials: 'include', // omit（默认，不带cookie）|same-origin(同源带cookie)|include(总是带cookie)
		// 	headers: { // headers: fetch事实标准中可以通过Header相关api进行设置
		// 		'Content-Type': 'application/x-www-form-urlencoded' // default: 'application/json'
		// 	},
		// 	body: "name=admin&word=admin" // body: fetch事实标准中可以通过Body相关api进行设置
		// })
		// .then(function(res) {
		// 	return res.json();
		// })
		// .then(function(data) { //res: fetch事实标准中可以通过Response相关api进行设置
		// 	$(".info").html(data && data.name);
		// }).catch(function(error) {
		// });
		$.ajax({
			type:"POST",
			url:"/registered",
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
