var logDAO = require('../dao/logDAO');
var userDAO = require('../dao/userDAO');
var express = require('express');
var router = express.Router();

router.get('/search', function(request, response) {
    console.log(request.session['username']);
    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    } else {
        userDAO.getByUsername(request.session['username'], function (user) {
            if(user["manage"] === 1){
                var param = request.query;
                console.log(param);
                logDAO.search(param, function (err, result, fields) {
                    response.json({message:'data',result:result});
                });
            } else {
                response.json({message:'url',result:'/index.html'});
            }
        });
    }
});

router.get('/forbid', function(request, response){
    console.log(request.session['username']);
    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    } else {
        userDAO.getByUsername(request.session['username'], function (user) {
            if(user["manage"] === 1){
                var usr = request.query.username;
                userDAO.forbid(usr, function(result){
                    response.json({message:'data',result:result})
                });
            } else {
                response.json({message:'url',result:'/index.html'});
            }
        });
    }
});

module.exports = router;
