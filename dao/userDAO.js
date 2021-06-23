var mongo = require('./mongodb.js')

module.exports = {
    add: function (user, callback) {
        var ins = {"name":user.username, "passwd": user.password, "available": 1};
        mongo.insert_user(ins);
        callback(true);
    },
    getByUsername: function (username, callback) {
        var que = {"name": username};
        mongo.search_user(que, {}, {}, function(result){
            if (result.length == 0)
                callback(result);
            else callback(result[0]);
        });
    },
    forbid: function(username, setavai, callback){
        var whe = {"name": username};
        var upd = {$set: {"available": setavai}};
        mongo.update_user(whe, upd, function(result){
            console.log(result);
            callback(true);
        });
    }
};
