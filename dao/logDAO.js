// 用于存放用户操作记录  日志
var mongo = require("./mongodb.js")

// 记录用户操作
module.exports = {
    userlog :function (useraction, callback) {
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
