var mysql = require('./db.js');
var crypto = require('crypto');

exports.login = function(req, res) {

	//res.end(JSON.stringify({name:"alros"}));
	//res.json({name:"alros"});
	res.json({
		name: "alros"
	});
}

//获取部门信息

exports.GetDepartInfo = function(req, res) {
	mysql.query("select DepartName,DepartId from Depart", function(err, result) {
		if (err) {
			res.json({
				err: err
			});
			return;
		}
		res.json(result);
	});
}

exports.registered = function(req, res) {
	var pwd = crypto.createHash('md5').update("admin").digest("hex");
	var obj = {
		UserName: req.body.name,
		PassWord: pwd,
		Phone: "18217090933",
		Sex: "男",
		Depart: 0,
		Status: ""
	};
	mysql.query("INSERT INTO User SET ?", function(err, result) {
		if (err) {
			res.json({
				err: pwd
			});
			return;
		}
		mysql.query("select UserName,Phone,Sex,Depart from User", function(err, result) {
			if (err) {
				res.json({
					err: err
				});
				return;
			}
			res.json(result);
		});
	}, obj);
}