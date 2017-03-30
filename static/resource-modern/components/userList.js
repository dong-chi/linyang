import React from 'React'
import ReactDom from 'ReactDom'

class UserList extends React.Component{
	constructor(props){
		super(props);
	}
	render(){
		let {data} = this.props.opts;
		return(
			<div className="container">
				<div className="row">
					<div className="col-xs-1 col-md-1 tabBorder">序号</div>
					<div className="col-xs-2 col-md-2 tabBorder">姓名</div>
					<div className="col-xs-2 col-md-2 tabBorder">所属部门</div>
					<div className="col-xs-1 col-md-1 tabBorder">性别</div>
					<div className="col-xs-2 col-md-2 tabBorder">电话</div>
					<div className="col-xs-2 col-md-2 tabBorder">注册日期</div>
					<div className="col-xs-2 col-md-2 tabBorder">更新日期</div>
				</div>
				{data.map((val, key) => {
					return <div className="row" key={key}>
								<div className="col-xs-1 col-md-1 tabBorder">{key}</div>
								<div className="col-xs-2 col-md-2 tabBorder">{val.UserName}</div>
								<div className="col-xs-2 col-md-2 tabBorder">{val.UserName}</div>
								<div className="col-xs-1 col-md-1 tabBorder">{val.Sex}</div>
								<div className="col-xs-2 col-md-2 tabBorder">{val.Phone}</div>
								<div className="col-xs-2 col-md-2 tabBorder">{val.AddDate}</div>
								<div className="col-xs-2 col-md-2 tabBorder">{val.EditDate}</div>
							</div>
				})}
			</div>
		)
	}
}


export default{
	renderComponent:function(opts,element,callback){
		return ReactDom.render(
				<UserList opts={opts}/>,element,function(){
					callback && callback();
				}
			)
	}
}