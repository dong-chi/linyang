import React from 'React'
import ReactDom from 'ReactDom'
import pageView from 'BaseView'
import register from 'register'

var View = pageView.extend({
	tourViewName: 'registerPage',
	events:{
		'click .black':'goBack',
		'click .btn-save-user' :'btnSave'
	},
	onCreate:function(){

	},
	onShow:function(){
		document.title = "新增用户";
		this.defaultInfo= {
			name:"",
			password:"",
			departid:0,
			sex:0,
			phone:""
		}
		this.showPage();
		//regCom.renderComponent({},document.getElementById(this.id));
	},
	goBack:function(){
		alros.goBack();
	},	
	showPage: function() {
		let self = this;
		$.ajax({
			type:"GET",
			url:"/getDepartInfo",
			dataType:"json",
			success:function(data){
				if(data && data.length > 0){
					self.defaultInfo.departInfo = data;
					register.renderComponent(self.defaultInfo,document.getElementById(self.id));
				}else{
					alert("部门信息获取失败");
				}
			},
			error:function(){

			}
		});
	},
	btnSave:function(){
		
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
