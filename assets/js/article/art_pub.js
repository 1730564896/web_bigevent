$(function(){
    let layer = layui.layer
    let form = layui.form
    
    initCate()
    // 初始化富文本编辑器
    initEditor()

    // 定义加载文章分类的方法
    function initCate() {
        $.ajax({
            method: "GET",
            url:'/my/article/cates',
            success: function(res){
                // console.log(res)
                if(res.status !== 0) {
                    return layer.msg('初始化文章分类失败')
                }
                // 使用模板引擎渲染分类的下拉菜单
                let htmlStr = template('tpl-cate',res)
                $('[name=cate_id]').html(htmlStr)
                form.render()
            }
        })
    }

    // 1. 初始化图片裁剪器
    let $image = $('#image')
     
    // 2. 裁剪选项
    let options = {
      aspectRatio: 400 / 280,
      preview: '.img-preview'
    }
    
    // 3. 初始化裁剪区域
    $image.cropper(options)

    // 为选择封面的按钮绑定点击事件
    $('#btnChooseImage').on('click',function(){
        $('#coverFile').click()
    })

    // 监听coverFile的change事件，获取用户选择的文件列表
    $('#coverFile').on('change',function(e){
        // 获取到文件的列表数组
        let files = e.target.files
        // 判断用户是否选择了文件
        if(files.length === 0) {
            return 
        }
        // 根据选择的文件，创建一个对应的 URL 地址
        let newImgURL = URL.createObjectURL(files[0])
        // 先`销毁`旧的裁剪区域，再`重新设置图片路径`，之后再`创建新的裁剪区域
        $image
      .cropper('destroy')      // 销毁旧的裁剪区域
      .attr('src', newImgURL)  // 重新设置图片路径
      .cropper(options)        // 重新初始化裁剪区域
    })

    // 定义文章的发布状态
    let art_State = '已发布'

    // 为存为草稿安纽绑定点击事件处理函数
    $('#btnSave2').on('click', function () {
        art_State = '草稿'
    })

    // 为表单绑定submit提交事件
    $('#form-pub').on('submit', function (e) {
        // 1.阻止表单的默认提交行为
        e.preventDefault()
        // 2.基于form表单快速创建一个FormDate对象
        let fd = new FormData($(this)[0])
        // 3.将文章的状态存到fd中
        fd.append('state', art_State)
        // fd.forEach(function(v,k) {
        //     console.log(k,v)
        // })

        // 4.将封面裁剪后的图片，输出为文件对象
        $image
        .cropper('getCroppedCanvas', {
         // 创建一个 Canvas 画布
          width: 400,
          height: 280
        })
        .toBlob(function(blob) {       
        // 将 Canvas 画布上的内容，转化为文件对象
        // 得到文件对象后，进行后续的操作
        // 5.将文件对象存储到fd中
        fd.append('cover_img', blob)

        // 6.发起ajax数据请求
        publishArticle(fd)
        })

        // 定义一个发布文章的方法
        function  publishArticle (){
            $.ajax({
                method:'POST',
                url:'/my/article/add',
                data:fd,
                contentType:false,
                processData:false,
                success:function(res){
                    if(res.status !== 0) {
                        return layer.msg('文章发布失败!')
                    }
                    layer.msg('文章发布成功!')
                    // 发布文章成功后，跳转到文章列表页面
                    location.href = 'http://127.0.0.1:5500/004-%E5%89%8D%E7%AB%AF%E4%B8%8E%E5%90%8E%E5%8F%B0%E4%BA%A4%E4%BA%92%E9%A1%B9%E7%9B%AE%E5%AE%9E%E6%88%98/%E7%AC%AC%E5%85%AB%E7%AB%A0%20%E5%A4%A7%E4%BA%8B%E4%BB%B6%E9%A1%B9%E7%9B%AE/day1/article/art_list.html'
                }
            })
        }

    })
})