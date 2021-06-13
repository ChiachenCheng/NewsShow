// var mysql = require('mysql');
// var mysqlConf = require('../conf/mysqlConf');
// var userSqlMap = require('./userSqlMap');
// var pool = mysql.createPool(mysqlConf.mysql);
// 使用了连接池，重复使用数据库连接，而不必每执行一次CRUD操作就获取、释放一次数据库连接，从而提高了对数据库操作的性能。
var mongo = require('./mongodb.js')

module.exports = {
    add: function (user, callback) {
        // pool.query(userSqlMap.add, [user.username, user.password], function (error, result) {
        //     if (error) throw error;
        //     callback(result.affectedRows > 0);
        // });
        var ins = {"name":user.username, "passwd": user.password, "available": 1};
        mongo.insert_user(ins);
        callback(true);
    },
    getByUsername: function (username, callback) {
        // pool.query(userSqlMap.getByUsername, [username], function (error, result) {
        //     if (error) throw error;
        //     callback(result);
        // });
        var que = {"name": username};
        mongo.search_user(que, {}, {}, function(result){
            if (result.length == 0)
                callback(result);
            else callback(result[0]);
        });
    },

};
