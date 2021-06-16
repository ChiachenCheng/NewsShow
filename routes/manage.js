var logDAO = require('../dao/logDAO');
var express = require('express');
var router = express.Router();

router.get('/search', function(request, response) {
    console.log(request.session['username']);
    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    } else {
        var param = request.query;
        console.log(param);
        logDAO.search(param, function (err, result, fields) {
            response.json({message:'data',result:result});
        })
    }
});

module.exports = router;
