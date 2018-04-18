这个目录是假数据目录，假数据语法参考 [mockjs](http://mockjs.com/examples.html)

假数据的命名规则：&lt;method&gt;-interface.json

如后台接口为：`POST` `/thor/desktop/shutdown`，则对应的 假数据文件为：`.data/thor/desktop/post-shutdown.json`

如果不希望使用假数据，修改 `webpack.config.js`，增加如下配置：

```json
{
    devServer: {
        // ...
        proxy: "http://172.16.201.188:8081"
    }
}
```
这种方式运行时浏览器请求由 webpack 处理后转发到 proxy 所指向的真实地址。

通常情况，不用这么麻烦，在浏览器控制台执行 `sessionStorage.vdi_dev_host = "172.16.201.188"` 并刷新即可。