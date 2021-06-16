// 用于存放用户操作记录  日志

//该文件没有用，最后选择使用express中间件 morgan记录日志（app.js中）
// var mysql = require('mysql');
// var mysqlConf = require('../conf/mysqlConf');
// var pool = mysql.createPool(mysqlConf.mysql);
// 使用了连接池，重复使用数据库连接，而不必每执行一次CRUD操作就获取、释放一次数据库连接，从而提高了对数据库操作的性能。
var mongo = require("./mongodb.js")

// 记录用户操作
module.exports = {
    userlog :function (useraction, callback) {
        // pool.query('insert into user_action(username,request_time,request_method,request_url,status,remote_addr) values(?, ?,?,?,?,?)',
        //     useraction, function (error, result) {
        //     if (error) throw error;
        //     callback(result.affectedRows > 0);
        // });
        var ins = {"username":useraction[0],"request_time":useraction[1],"request_method":useraction[2],"request_url":useraction[3],"status":useraction[4],"remote_addr":useraction[5]};
        mongo.insert_logs(ins);
        callback(true);
    },
    search :function(searchparam, callback){
        var user = searchparam["u"];
        var oper = searchparam["o"];
        var and_array = [];

        if(user!="undefined")
            and_array.push({"username":user});
        if(oper!="undefined")
            and_array.push({"request_url":{"$regex":oper}});
        var que = {"$and":and_array};
        var col = {"_id":0, "remote_addr":0};
        var seq = {};
        if(searchparam['stime']!="undefined"){
            if(searchparam['stime']=="1"){
                seq = {"request_time": 1};
            }else {
                seq = {"request_time": -1};
            }
        }
        
        mongo.search_logs(que, col, seq, function(result){
            callback(null, result, null); //事件驱动回调
        });
    }
};
