// var mysql = require('mysql');
// var mysqlConf = require('../conf/mysqlConf');
// var pool = mysql.createPool(mysqlConf.mysql);
// 使用了连接池，重复使用数据库连接，而不必每执行一次CRUD操作就获取、释放一次数据库连接，从而提高了对数据库操作的性能。
var mongo = require("./mongodb.js")

module.exports = {
    query_noparam :function(que, col, seq, callback) {
        // pool.getConnection(function(err, conn) {
        //     if (err) {
        //         callback(err, null, null);
        //     } else {
        //         conn.query(sql, function(qerr, vals, fields) {
        //             conn.release(); //释放连接
        //             callback(qerr, vals, fields); //事件驱动回调
        //         });
        //     }
        // });
        mongo.search_web(que, col, seq, function(result){
            callback(null, result, null); //事件驱动回调
        });
    },
    search :function(searchparam, callback) {
        // // 组合查询条件
        // var sql = 'select * from fetches ';

        // if(searchparam["t2"]!="undefined"){
        //     sql +=(`where title like '%${searchparam["t1"]}%' ${searchparam['ts']} title like '%${searchparam["t2"]}%' `);
        // }else if(searchparam["t1"]!="undefined"){
        //     sql +=(`where title like '%${searchparam["t1"]}%' `);
        // };

        // if(searchparam["t1"]=="undefined"&&searchparam["t2"]=="undefined"&&searchparam["c1"]!="undefined"){
        //     sql+='where ';
        // }else if(searchparam["t1"]!="undefined"&&searchparam["c1"]!="undefined"){
        //     sql+='and ';
        // }

        // if(searchparam["c2"]!="undefined"){
        //     sql +=(`content like '%${searchparam["c1"]}%' ${searchparam['cs']} content like '%${searchparam["c2"]}%' `);
        // }else if(searchparam["c1"]!="undefined"){
        //     sql +=(`content like '%${searchparam["c1"]}%' `);
        // }

        // if(searchparam['stime']!="undefined"){
        //     if(searchparam['stime']=="1"){
        //         sql+='ORDER BY publish_date ASC ';
        //     }else {
        //         sql+='ORDER BY publish_date DESC ';
        //     }
        // }

        // sql+=';';
        // pool.getConnection(function(err, conn) {
        //     if (err) {
        //         callback(err, null, null);
        //     } else {
        //         conn.query(sql, function(qerr, vals, fields) {
        //             conn.release(); //释放连接
        //             callback(qerr, vals, fields); //事件驱动回调
        //         });
        //     }
        // });
        var title = searchparam["t"];
        var keyword = searchparam["k"];
        var content = searchparam["c"];
        var allword = searchparam["a"];
        console.log(title);

        var or_array = [];
        if(title!="undefined")
            or_array.push({"title":{"$regex":searchparam["t"]}})
        if(keyword!="undefined")
            or_array.push({"keywords":{"$regex":keyword}})
        if(content!="undefined")
            or_array.push({"content":{"$regex":content}})
        if(allword!="undefined")
            or_array=[{"title":{"$regex":allword}}, {"keywords":{"$regex":allword}}, 
                    {"content":{"$regex":allword}}, {"desc":{"$regex":allword}}, 
                    {"source_name":{"$regex":allword}}, {"publish_date":{"$regex":allword}}]
        var que = {"$or":or_array};
        var col = {"_id":0, "source_encoding":0, "crawltime":0};
        var seq = {};

        if(searchparam['stime']!="undefined"){
            if(searchparam['stime']=="1"){
                seq = {"publish_date": 1};
            }else {
                seq = {"publish_date": -1};
            }
        }

        mongo.search_web(que, col, seq, function(result){
            // response.writeHead(200, {
            //     "Content-Type": "application/json"
            // });
            // response.write(JSON.stringify(result));
            // response.end();
            callback(null, result, null); //事件驱动回调
        });

    },


};
