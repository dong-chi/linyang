import React from 'React'
import ReactDom from 'ReactDom'

class Registered extends React.Component {
	constructor(props) {
		super(props);
		//let {...props} = props.opts;
		//departInfo:部门信息数组
		//userInfo:用户信息
		//defaultInfo:初始注册用户信息
		//editUserInfo:编辑中的用户信息
		//isLoadingUser是否加载用户信息
		this.state = {
			departInfo: {
				name: "",
				password: "",
				departid: 0,
				sex: 0,
				phone: ""
			}
		};
	}
	render() {
		let {...props} = this.props.opts;
		return ( 
			<div className="container">
				<div className="row">
					<div className="col-md-4 col-md-offset-4">
						<form className="form-horizontal">
							<h2>注册人员信息</h2>
							<div className="form-group">
								<label className="col-sm-3 control-label">姓名</label>
								<div className="col-sm-9">
									<input type = "text" value={props.name} className="form-control" placeholder="输入姓名" / >
								</div>
							</div>
							<div className="form-group">
								<label className="col-sm-3 control-label">昵称</label>
								<div className="col-sm-9">
									<input type = "text" value={props.pname} className="form-control" placeholder="输入姓名" / >
								</div>
							</div>
							<div className="form-group">
								<label className="col-sm-3 control-label">密码</label>
								<div className="col-sm-9">
									<input type = "password" value={props.password} className="form-control" placeholder="输入密码" / >
								</div>
							</div>
							<div className="form-group">
								<label className="col-sm-3 control-label">所属部门</label>
								<div className="col-sm-9">
									<select className="form-control">
										<option value="0">--选择部门--</option>
									    {props.departInfo.map((val) => {
									    	return <option value={val.DepartId}>{val.DepartName}</option>
									    })}
									</select>
								</div>
							</div>
							<div className="form-group">
								<label className="col-sm-3 control-label">性别</label>
								<div className="col-sm-9">
									<select className="form-control">
										<option>--选择性别--</option>
										<option>男</option>
									    <option select>女</option>
									</select>
								</div>
							</div>
							<div className="form-group">
								<label className="col-sm-3 control-label">联系电话</label>
								<div className="col-sm-9">
									<input type = "password" value={props.phone} className="form-control" placeholder="输入联系电话" / >
								</div>
							</div>
							<div className="form-group">
								<div className="col-md-2 col-md-offset-4">
									<a className="btn btn-primary btn-save-user" href="javascript:;" role="button">保存</a>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		)

	}
}

export default {
	renderComponent: function(opts, element, callback) {
		return ReactDom.render( < Registered opts = {
				opts
			}
			/>,element,function(){
			callback && callback();
		}
	);
}
}