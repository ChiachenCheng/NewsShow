var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var insert_web = function(webjson) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("crawler");
        try{
            dbo.collection("web").insertOne(webjson, function(err, res) {
                if (err) console.log('可能是异步重复url出错：' + err);
                console.log("文档插入成功");
                db.close();
            });
        } catch (e) { console.log('可能是异步重复url出错：' + e) };
    });
};

var search_web = function(webjson, coljson, seqjson, callback) {
    MongoClient.connect(url, function(err, db) {
        if (err) console.log('查询出错：' + err);
        var dbo = db.db("crawler");
        dbo.collection("web").find(webjson).project(coljson).sort(seqjson).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            // console.log(result);
            db.close();
            callback(result);
        });
    });
};

var insert_user = function(webjson) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("crawler");
        try{
            dbo.collection("users").insertOne(webjson, function(err, res) {
                if (err) console.log('注册时出错：' + err);
                console.log("注册成功");
                db.close();
            });
        } catch (e) { console.log('注册时出错：' + e) };
    });
};

var search_user = function(webjson, coljson, seqjson, callback) {
    MongoClient.connect(url, function(err, db) {
        if (err) console.log('查询/登陆出错：' + err);
        var dbo = db.db("crawler");
        dbo.collection("users").find(webjson).project(coljson).sort(seqjson).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            db.close();
            callback(result);
        });
    });
};

var insert_logs = function(webjson) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("crawler");
        try{
            dbo.collection("logs").insertOne(webjson, function(err, res) {
                if (err) console.log('插入日志时出错：' + err);
                console.log("日志插入成功");
                db.close();
            });
        } catch (e) { console.log('日志插入时出错：' + e) };
    });
};

var search_logs = function(webjson, coljson, seqjson, callback) {
    MongoClient.connect(url, function(err, db) {
        if (err) console.log('查询日志出错：' + err);
        var dbo = db.db("crawler");
        dbo.collection("logs").find(webjson).project(coljson).sort(seqjson).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            db.close();
            callback(result);
        });
    });
};

exports.insert_web = insert_web;
exports.search_web = search_web;
exports.insert_user = insert_user;
exports.search_user = search_user;
exports.insert_logs = insert_logs;
exports.search_logs = search_logs;