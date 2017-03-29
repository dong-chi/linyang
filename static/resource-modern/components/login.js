import React from 'React'
import ReactDom from 'ReactDom'

class Panel extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return ( < div className="center-block">
			< span > 姓名 < /span> < input type = "text" className="input_name" / >
			< span > 密码 < /span> < input type = "text" className="input_word" / >
			< /div>
		)

	}
}

export default {
	renderComponent: function(opts, element, callback) {
		return ReactDom.render( < Panel opts = {
				opts
			}
			/>,element,function(){
			callback && callback();
		}
	);
}
}