var mongo = require("./mongodb.js")
var nodejieba = require('nodejieba');

module.exports = {
    query_noparam :function(que, col, seq, callback) {
        mongo.search_web(que, col, seq, function(result){
            callback(null, result, null); //事件驱动回调
        });
    },
    search :function(searchparam, callback) {
        var title = searchparam["t"];
        var keyword = searchparam["k"];
        var content = searchparam["c"];
        var allword = searchparam["a"];

        var key_n = 5;
        var or_array = [];
        var words = undefined;
        var words_array = [];
        if(title!="undefined")
            or_array.push({"title":{"$regex":title}})
        if(keyword!="undefined")
            or_array.push({"keywords":{"$regex":keyword}})
        if(content!="undefined"){
            words = nodejieba.extract(content, key_n);
            for (var i=0; i<words.length; i++){
                wd = words[i];
                words_array.push({"content":{"$regex":wd["word"]}})
            }
            or_array.push({"$or":words_array})
        }
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
            if(searchparam['stime']=="undefined"){
                if(content!="undefined" && words!=undefined){
                    var m = new Map();
                    for(var i = 0; i < words.length; i++){
                        var t = words[i];
                        m.set(t["word"], t["weight"]);
                    }
                    for(var i=0;i<result.length;i++){
                        var ele = result[i];
                        var temp_content = ele["content"];
                        var contentkeywds = nodejieba.extract(temp_content, key_n);
                        var s = 0;
                        for (var j=0; j<contentkeywds.length; j++){
                            var wwd = contentkeywds[j];
                            if(m.has(wwd["word"])){
                                s += m.get(wwd["word"]);
                            }                    
                        }
                        (result[i])["weight"] = s;
                    }
                }
            }
            result.sort(function(a,b){
                return b["weight"] - a["weight"];
            })
            callback(null, result, null); //事件驱动回调
        });

    },
};
