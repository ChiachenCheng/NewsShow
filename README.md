# Web编程第二次项目报告

| 课程名称：Web编程 | 项目名称：数据展示网站 | 指导老师：王晔 |
| ----------------- | ---------------------- | -------------- |
| **姓名：郑佳辰**  | **学号：10182100359**  | **年级：2018** |

## 实验要求

基于第一个项目爬虫爬取的数据，完成数据展示网站。

基本要求：

1、用户可注册登录网站，非注册用户不可登录查看数据

2、用户注册、登录、查询等操作记入数据库中的日志

3、爬虫数据查询结果列表支持分页和排序

4、用Echarts或者D3实现3个以上的数据分析图表展示在网站中

5、实现一个管理端界面，可以查看（查看用户的操作记录）和管理（停用启用）注册用户。

扩展要求（非必须）：

1、实现对爬虫数据中文分词的查询

2、实现查询结果按照主题词打分的排序

3、用Elastic Search+Kibana展示爬虫的数据结果

## 网站整体介绍

### 数据库修改

本次的实验中展示的新闻数据来自上次爬虫实验中爬取的新闻页面，数据库与上次实验中采用的数据库相同，为MongoDB。为了实现要求中提到的各种功能，需要修改数据库添加新的文档集。实验参考了老师给出的示例代码。在本次实验中，需要在数据库中新建users和logs文档集，他们分别用来存储用户的基本信息和日志。

users文档集的字段包括ObjectId即_id，存储用户名的name，存储密码的passwd，标识账号是否可用的available，以及管理员专用的字段manage。其中name和passwd的数据类型为String类型，而available和manage字段的数据类型为整数，且取值为0或1。

logs文档集的字段包括包括ObjectId即_id，存储用户名username，标识请求时间的request_time，标识请求方法的request_method，请求路径request_url等字段。它们的具体意义将在后面详细描述。

对于数据库的物理设计而言，在MongoDB中，除了_id字段上必然建立主索引之外，在其他字段上也可建立辅助索引。对于本次实验新建的users和logs文档集来说，他们都以用户名建立了索引，用于加速查询。在users文档集中是以name为关键字建立索引，而在logs文档集中是以username为关键字建立索引。

### 分层结构介绍

在宏观角度上，各功能的实现具有共性，即首先从前端接收用户输入的数据，然后传到后端进行处理，并对数据库进行访问。将数据库中返回的结果进行处理并传给前端，然后由前端渲染后显示给用户。这样就形成了一个简单的分层结构。

在软件体系架构设计中，分层式结构是最常见，也是最重要的一种结构。微软推荐的分层式结构一般分为三层，从下至上分别为：数据访问层、业务逻辑层（又或称为领域层）、表示层。区分层次的目的即为了“高内聚低耦合”的思想。第一层是数据访问层即Dao(Data Access Object)层，主要是对数据库的操作层。第二层是业务逻辑层(Service层)，主要是针对具体的问题的操作，也可以理解成对数据业务逻辑处理。第三是界面层，即controller层或action层，主要表示WEB方式。

在我的代码里，前端包括界面层，主要由`public/*.html`及`public/javaxcripts/*.js`组成，也包括public目录下的其他内容。用户输入的数据经html中调用的js代码向逻辑层发送。逻辑层属于后端的范围，包括`routes/*.js`中的node.js代码，这里主要是处理前端传输过来的数据，按照一定的业务逻辑访问数据库并返回结果。数据访问层的代码主要在`dao/*.js`中，用于访问数据库，其中的`mongodb.js`是之前已经编写好的对数据库的访问接口，方便直接调用。接下来将分功能介绍数据展示网站的各个功能实现。

## 基本要求实现

### 注册登录功能

在注册时，我们需要先从表单中接收数据，然后通过/users/register路径将数据传入后端，这里在前端对两次输入的密码进行比较，来确定用户两次输入的密码是否一致。同时，为了防止在日志中记录密码明文，或将密码明文直接显示到url里，这里采用了post的方法对数据进行传输，这样可以保护要传输的数据。如果注册成功，则使用跳转功能跳转到登录页面。

```javascript
//增加注册用户
$scope.doAdd = function () {
    // 检查用户注册时，输入的两次密码是否一致
    if($scope.add_password!==$scope.confirm_password){
        $scope.msg = '两次密码不一致！';
    }
    else {
        var data = JSON.stringify({
            username: $scope.add_username,
            password: $scope.add_password
        });
        $http.post("/users/register", data)
            .then(function (res) {
                if(res.data.msg=='成功注册！请登录') {
                    $scope.msg=res.data.msg;
                    $timeout(function () {
                        window.location.href='index.html';
                    },2000);

                } else {
                    $scope.msg = res.data.msg;
                }
            }, function (err) {
                $scope.msg = err.data;
            });
    }
};
```

在数据库中直接存储密码明文是非常不安全的，所以我使用了md5加密和简单的密码加盐技术存储密文。将明文转换为密文的过程在后端进行，在比较密码时直接比对密文即可。由于用户名是每个应户唯一的标识，所以需要先在后端检查用户是否存在，若不存在则可以添加用户，逻辑层代码如下所示。

```javascript
router.post('/register', function (req, res) {
  var add_user = req.body;
  add_user.password = md5("1999" + add_user.password + "1205");
  // 先检查用户是否存在
  userDAO.getByUsername(add_user.username, function (user) {
    if (user.length != 0) {
      res.json({msg: '用户已存在！'});
    }else {
      userDAO.add(add_user, function (success) {
        res.json({msg: '成功注册！请登录'});
      })
    }
  });

});
```

DAO层的代码如下所示。在本层尽量将每段代码分解成一次访问数据库的操作，在逻辑层再按照逻辑拼接成为一整个功能。这里可以看到查询用户主要靠用户名进行，将用户名建立一个索引可以加速这个查询过程。

```javascript
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
};
```

这里用到的访问数据库中user文档集的代码如下，与之前的版本大同小异。

```javascript
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
        dbo.collection("users").find(webjson).project(coljson).sort(seqjson).toArray(function(err, result) { 
            if (err) throw err;
            db.close();
            callback(result);
        });
    });
};
```

登录功能的设置与之相同，首先通过/users/login路径传输数据，然后从后端对比用户名和密码密文。在前端如果陈工登录，则直接跳转到news所在路径。需要在此说明这种跳转方法只能跳转get方法可以显示的页面，如果是post方法对应的链接则不可跳转。

```javascript
$scope.check_pwd = function () {
    var data = JSON.stringify({
        username: $scope.username,
        password: $scope.password
    });
    $http.post("/users/login", data)
        .then(
        function (res) {
            if(res.data.msg=='ok') {
                window.location.href='/news.html';
            }else{
                $scope.msg=res.data.msg;
            }
        },
            function (err) {
            $scope.msg = err.data;
        });

};
```

登录时需要判断用户名是否存在，密码是否正确，也要判断该账号是否可用。如果在管理界面账户被停用，则无法登录。

```javascript
router.post('/login', function(req, res) {
  var username = req.body.username;
  var password = md5("1999" + req.body.password + "1205");

  userDAO.getByUsername(username, function (user) {
    console.log(user)
    if(user.length==0){
      res.json({msg:'用户不存在！请检查后输入'});
    }else {
      if(password===user["passwd"]){
        if(user["available"]===1){
          req.session['username'] = username;
          res.cookie('username', username);
          res.json({msg: 'ok'});
        } else {
          res.json({msg:'您的账号被禁用，请联系管理员！'});
        }
      }else{
        res.json({msg:'用户名或密码错误！请检查后输入'});
      }
    }
  });
});
```

要实现未注册用户无法查看数据，有两种实现方式。一种是将html网页移出public文件夹，并将访问网页的所有路径除主页外全部设置为post方法。这样未登录的用户在访问页面时就会遇到错误。但是由于使用post方法访问网页时跳转比较困难，所以未采用这种方法。

另一种是将html文件保留在public文件夹中，但在访问数据时检查是否登录，如果有，则正常进行操作；如果没有，则强制跳转回登录页面。如下面的搜索功能的后端代码。如果session中没有username项，则直接跳转回主页。本项目中的登录检查以及权限检查大部分都采用这种方法。

```javascript
router.get('/search', function(request, response) {
    if (request.session['username']===undefined) {
        response.json({message:'url',result:'/index.html'});
    } else {
        var param = request.query;
        console.log(param);
        newsDAO.search(param, function (err, result, fields) {
            // console.log(result);
            response.json({message:'data',result:result});
        })
    }
});
```



### 记录日志



### 分页和排序

### 数据分析图表

### 管理端界面

## 扩展要求实现

### 中文分词查询

### 查询结果打分

## 代码链接

目前我的代码已上传至Github，链接为：https://github.com/ChiachenCheng/NewsShow

