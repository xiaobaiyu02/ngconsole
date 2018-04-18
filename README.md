# ngconsole

这里是 VDI 前端仓库

## 开始
安装依赖：`npm install`

开发的时候推荐使用 `webpack-dev-server` 来启动项目

## 如何打包？
```bash
# 默认情况
npm run build

# 只 build ngconsole
node build.js --no-client=true

# 只 build 客户端
node build.js --no-ngconsole=true
```

## 分支名约定
迭代版格式：`x.y.z-dev`
特版格式： `x.y.z-OEM-huipu`