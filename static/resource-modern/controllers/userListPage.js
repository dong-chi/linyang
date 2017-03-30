
import pageView from 'BaseView'
import userList from 'userList'

var View = pageView.extend({
	events:{
		
	},
	onCreate:function(){

	},
	onShow:function(){
		this.getUserList();
	},	
	getUserList: function() {
		let self = this;
		$.ajax({
			type:"get",
			url:"/getUsers_if",
			dataType:"json",
			success:function(data){
				//console.log(data);
				let opts={
					data
				};
				userList.renderComponent(opts,document.getElementById(self.id),function(){

				});
			},
			error:function(){

			}
		});

	}
});
export default View;
