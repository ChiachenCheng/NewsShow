var app = angular.module('manage', []);
app.controller('manage_Ctrl', function ($scope, $http, $timeout) {
    // 控制查询页面是否显示
    $scope.showSearch = function () {
        $scope.isShow = true;
        $scope.isisshowresult = false;

        // 再次回到查询页面时，表单里要保证都空的
        $scope.title=undefined;
        // $scope.title2=undefined;
        // $scope.selectTitle='AND';
        $scope.keyword=undefined;
        $scope.content=undefined;
        $scope.allword=undefined;
        // $scope.content2=undefined;
        // $scope.selectContent='AND';
        $scope.sorttime=undefined;
    };

    $scope.logout = function () {

        // $http.get().then();

        $http.get("/users/logout").then(
            function (res) {
                window.location.href=res.data.result;

            },function (err) {
                $scope.msg = err.data;
            }
        );

    };

    $scope.backToNews = function () {
        window.location.href="/news.html";
    };

    // 查询数据
    $scope.search = function () {
        var user = $scope.user;
        var oper = $scope.oper;
        var sorttime = $scope.sorttime;

        var myurl = `/manage/search?u=${user}&o=${oper}&stime=${sorttime}`;

        $http.get(myurl).then(
            function (res) {
                if(res.data.message=='data'){
                    $scope.isisshowresult = true; //显示表格查询结果
                    // $scope.searchdata = res.data;
                    $scope.initPageSort(res.data.result)
                }else {
                    window.location.href=res.data.result;
                }


            },function (err) {
                $scope.msg = err.data;
            });
    };

    // 分页
    $scope.initPageSort=function(item){
        $scope.pageSize=5;　　//每页显示的数据量，可以随意更改
        $scope.selPage = 1;
        $scope.data = item;
        $scope.pages = Math.ceil($scope.data.length / $scope.pageSize); //分页数
        $scope.pageList = [];//最多显示5页，后面6页之后不会全部列出页码来
        $scope.index = 1;
        // var page = 1;
        // for (var i = page; i < $scope.pages+1 && i < page+5; i++) {
        //     $scope.pageList.push(i);
        // }
        var len = $scope.pages> 5 ? 5:$scope.pages;
        $scope.pageList = Array.from({length: len}, (x,i) => i+1);

        //设置表格数据源(分页)
        $scope.items = $scope.data.slice(0, $scope.pageSize);

    };

    //打印当前选中页
    $scope.selectPage = function (page) {
        //不能小于1大于最大（第一页不会有前一页，最后一页不会有后一页）
        if (page < 1 || page > $scope.pages) return;
        //最多显示分页数5，开始分页转换
        var pageList = [];
        if(page>2){
            for (var i = page-2; i <= $scope.pages && i < page+3; i++) {
                pageList.push(i);
            }
        }else {
            for (var i = page; i <= $scope.pages && i < page+5; i++) {
                pageList.push(i);
            }
        }

        $scope.index =(page-1)*$scope.pageSize+1;
        $scope.pageList = pageList;
        $scope.selPage = page;
        $scope.items = $scope.data.slice(($scope.pageSize * (page - 1)), (page * $scope.pageSize));//通过当前页数筛选出表格当前显示数据
        console.log("选择的页：" + page);
    };

    //设置当前选中页样式
    $scope.isActivePage = function (page) {
        return $scope.selPage == page;
    };
    //上一页
    $scope.Previous = function () {
        $scope.selectPage($scope.selPage - 1);
    };
    //下一页
    $scope.Next = function () {
        $scope.selectPage($scope.selPage + 1);
    };

    $scope.searchsortASC = function () {
        $scope.sorttime = '1';
        $scope.search();
    };
    $scope.searchsortDESC = function () {
        $scope.sorttime = '2';
        $scope.search();
    };

});