var newsDAO = require('../dao/newsDAO');
var express = require('express');
var router = express.Router();

var mywordcutModule = require('./wordcut.js');
var myfreqchangeModule = require('./freqchange.js');


router.get('/search', function(request, response) {
    console.log(request.session['username']);
    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    } else {
        var param = request.query;
        console.log(param);
        newsDAO.search(param, function (err, result, fields) {
            console.log(result);
            response.json({message:'data',result:result});
        })
    }
});

router.get('/histogram', function(request, response) {
    //sql字符串和参数
    console.log(request.session['username']);

    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    } else {
        // var fetchSql = "select publish_date as x,count(publish_date) as y from fetches group by publish_date order by publish_date;";
        var col = {"_id":0, "publish_date":1};
        var seq = {"publish_date": 1};

        newsDAO.query_noparam({}, col, seq, function (err, result, fields) {
            var m = new Map();
            for(var i = 0; i < result.length; i++){
                var date = result[i].publish_date;
                var temp = 0;
                if(m.has(date))
                    temp = m.get(date);
                m.set(date, temp + 1);
            }
            ret = []
            for (let[k,v] of m) {
                ret.push({"x":k, "y":v});
            }
            response.writeHead(200, {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": 0
            });
            response.write(JSON.stringify({message:'data',result:ret}));
            response.end();
        });
    }
});


router.get('/pie', function(request, response) {
    //sql字符串和参数
    console.log(request.session['username']);
    console.log("12345678")

    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    } else {
        // var fetchSql = "select author as x,count(author) as y from fetches group by author;";
        var col = {"_id":0, "author":1};
        var seq = {"author": 1};
        newsDAO.query_noparam({}, col, seq, function (err, result, fields) {
            var m = new Map();
            for(var i = 0; i < result.length; i++){
                var date = result[i].author
                var temp = 0;
                if(m.has(date))
                    temp = m.get(date);
                m.set(date, temp + 1);
            }
            ret = []
            for (let[k,v] of m) {
                ret.push({"x":k, "y":v});
            }
            response.writeHead(200, {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": 0
            });
            response.write(JSON.stringify({message:'data',result:ret}));
            response.end();
        });
    }
});

router.get('/line', function(request, response) {
    //sql字符串和参数
    console.log(request.session['username']);

    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    }else {
        var keyword = '疫情'; //也可以改进，接受前端提交传入的搜索词
        // var fetchSql = "select content,publish_date from fetches where content like'%" + keyword + "%' order by publish_date;";
        var que = {"content":{"$regex":keyword}};
        var col = {"_id":0, "content":1, "publish_date":1};
        var seq = {"publish_date": 1};
        newsDAO.query_noparam(que, col, seq, function (err, result, fields) {
            response.writeHead(200, {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": 0
            });
            response.write(JSON.stringify({message:'data',result:myfreqchangeModule.freqchange(result, keyword)}));
            response.end();
        });
    }
});

router.get('/wordcloud', function(request, response) {
    //sql字符串和参数
    console.log(request.session['username']);

    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    }else {
        // var fetchSql = "select content from fetches;";
        var que = {}
        var col = {"_id":0, "content":1}
        newsDAO.query_noparam({}, col, {}, function (err, result, fields) {
            response.writeHead(200, {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": 0
            });
            response.write(JSON.stringify({message:'data',result:mywordcutModule.wordcut(result)}));//返回处理过的数据
            response.end();
        });
    }
});


module.exports = router;
