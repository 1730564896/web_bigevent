$(function(){
    let layer = layui.layer
    let form = layui.form
    let laypage = layui.laypage
    
    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(date) {
        let dt = padZero(new Date(date))
        let y = padZero(dt.getFullYear())
        let m = padZero(dt.getMonth() + 1)
        let d = padZero(dt.getDate())
        let hh = padZero(dt.getHours())
        let mm = padZero(dt.getMinutes())
        let ss = padZero(dt.getSeconds())
        return y + '-' + m + '-' + d + '  ' +  hh + ':' + mm + ':' + ss
    }

    // 定义补零函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 定义一个查询的参数对象，将来请求数据的时候需要将请求参数发送到服务器
    let q = {
        pagenum:1,                    //页码值,默认请求第一页的数据
        pagesize:2,                    //每页显示多少条数据，默认每页显示两条
        cate_id:'',                  //文章分类的 Id
        state:''                        //文章的状态
    }

    initTable()
    // 获取文章列表数据数据的方法
    function initTable() {
        $.ajax({
            method: "GET",
            url:'/my/article/list',
            data:q,
            success:function(res){
                console.log(res)
                if(res.status !== 0){
                    return layer.msg('获取文章列表失败!')
                }
                // 使用模板引擎渲染页面数据
                let htmlStr = template('tpl-table',res)
                $('tbody').html(htmlStr)
                // 渲染分页区域
                renderPage(res.total)
            }
        })
    }


    initCate()
    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method:'GET',
            url:'/my/article/cates',
            success:function(res){
                // console.log(res)
                if(res.status !== 0) {
                    return layer.msg('获取分类数据失败！')
                }
                 // 调用模板引擎渲染分类的可选项
                 let htmlStr = template('tpl-cate',res)
                //  console.log(htmlStr)
                 $('[name=cate_id]').html(htmlStr)
                //  通过layUI重新渲染表单区域的UI结构
                 form.render()
            }
        })
    }

    // 为筛选表单绑定submit事件
    $('#form-search').on('submit', function(e){
        e.preventDefault()
        // 获取表单中选中项的值
        let cate_id = $('[name=cate_id]').val()
        let state = $('[name=state]').val()
        // 为查询参数对象q中对应的属性赋值
        q.cate_id = cate_id
        q.state = state
        // 个人剧最新的筛选条件，重新渲染表格的数据
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage( total) {
        laypage.render({
            elem:'pageBox',       //分页容器的id
            count:10,          //总数据条数
            limit:q.pagesize,      //每页显示几条数据
            curr:q.pagenum,      //设置默认被选中的分页
            layout:['count','limit','prev','page','next','skip'],
            limits:[2,3,5,10],
            jump:function(obj,first){
                // console.log(first)
                // 可以通过first的值判断是哪种方式触发的jump回调，如果是true则证明是第一种方式触发的，否则是第二种
                // 触发jump回调的方式有两种：
                // 1.分页发生切换时，触发jump回调函数  2.只要调用了renderPagez这个方法，就会出发jump回调
                // console.log(obj.curr)
                // 把最新的页码值，赋值到q这个查询参数对象中
                q.pagenum = obj.curr
                // 把最新的条目数赋值给参数查询对象的pagesize属性中
                q.pagesize = obj.limit
                // 根据最新的q获取对应的数据列表并渲染表格
                // initTable()
                if(!first) {
                    initTable()
                }
            }
        })
    }

    // 通过代理的方式，为删除按钮绑定点击事件处理函数
    $('body').on('click','.btn-delete',function(){
        // 获取删除按钮的个数
        let len = $('btn-delete').length
        let id = $(this).attr('data-id')
        // console.log(1)
        // 询问用户是否删除
        layer.confirm('确认删除?', {icon: 3, title:'提示'}, function(index){
            //do something
            $.ajax({
                method: "GET",
                url:'/my/article/delete/' + id,
                success:function(res){
                    if(res.status !== 0){
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！')
                    // 当数据删除完成后，需要判断这一页中是否还有剩余的数据
                    // 如果没有剩余的数据，则让页码值-1之后再重新调用initTable()渲染
                    if(len === 1) {
                        // 如果len值等于1 ，证明删除完毕之后，页面上就没有任何数据了
                        q.pagenum = q.pagenum === 1 ? 1: q.pagenum - 1 
                    }
                    initTable()
                }
            })
            layer.close(index)
        })
    })
})