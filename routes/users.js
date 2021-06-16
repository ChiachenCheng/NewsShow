var express = require('express');
var router = express.Router();
var userDAO = require('../dao/userDAO');

router.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  // var sess = req.session;

  userDAO.getByUsername(username, function (user) {
    console.log(user)
    if(user.length==0){
      res.json({msg:'用户不存在！请检查后输入'});
    }else {
      if(password===user["passwd"]){
        req.session['username'] = username;
        res.cookie('username', username);
        res.json({msg: 'ok'});
        // res.json({msg:'ok'});
      }else{
        res.json({msg:'用户名或密码错误！请检查后输入'});
      }
    }
  });
});


/* add users */
router.post('/register', function (req, res) {
  var add_user = req.body;
  // 先检查用户是否存在
  userDAO.getByUsername(add_user.username, function (user) {
    if (user.length != 0) {
      // res.render('index', {msg:'用户不存在！'});
      res.json({msg: '用户已存在！'});
    }else {
      userDAO.add(add_user, function (success) {
        res.json({msg: '成功注册！请登录'});
      })
    }
  });

});

// 退出登录
router.get('/logout', function(req, res, next){
  // 备注：这里用的 session-file-store 在destroy 方法里，并没有销毁cookie
  // 所以客户端的 cookie 还是存在，导致的问题 --> 退出登陆后，服务端检测到cookie
  // 然后去查找对应的 session 文件，报错
  // session-file-store 本身的bug

  req.session.destroy(function(err) {
    if(err){
      res.json('退出登录失败');
      return;
    }

    // req.session.loginUser = null;
    res.clearCookie('username');
    res.json({result:'/index.html'});
  });
});

router.get("/manage", function(req, res, next){
  var usr = req.session["username"];
  if (usr===undefined) {
    // response.redirect('/index.html')
    response.json({message:'url',result:'/index.html'});
  } else {
    userDAO.getByUsername(usr, function (user) {
      if(user.length != 0 && user["manage"] == 1){
        res.json({result:'/manage.html'});
      } else {
        res.json({result:'/index.html',msg:'您没有管理员权限！'});
        return;
      }
    });
  }
});

module.exports = router;
