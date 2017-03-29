import React from 'React'
import ReactDom from 'ReactDom'

class LeftTree extends React.Component{
	constructor(props){
		super(props);
	}
	pageGoto(num){
		if(num === 1){
			alros.goTo("/registerPage");else if ()
		}else if (num === 2){
			alros.goTo("/userListPage");else if ()
		}
	}
	render(){
		return(
			<ul>
				<li>新增用户</li>
				<li>用户列表</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
			</ul>	
		)
	}
}


export default{
	renderComponent:function(opts,element,callback){
		return ReactDom.render(
				<LeftTree opts={opts}/>,element,function(){
					callback && callback();
				}
			)
	}
}