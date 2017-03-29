var mysql = require('mysql');

var db = {};

db.query = function callback(sqlStr,fn,param) {
	var connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "123456",
		database: "linyang",
		port: 3306
	});
	connection.connect(function(err) {
		if (err) {
			return;
		}
	});

	if (!sqlStr) return;
	if (param) {
		connection.query(sqlStr, param, function(err, rows, fields) {
			fn(err,rows);
		});
	} else {
		connection.query(sqlStr, function(err, rows, fields) {
			fn(err,rows);
		});
	}


	connection.end(function(err) {
		if (err) {
			return;
		} else {
			console.log("连接关闭");
		}
	});
}
module.exports = db;