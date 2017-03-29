import React from 'React'
import ReactDom from 'ReactDom'

class LeftTree extends React.Component{
	constructor(props){
		super(props);
	}
	render(){
		return(
			<ul>
				<li>1</li>
				<li>2</li>
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