## ngconsole和ngconsole_resources两项目相互依赖，项目名不可更改

## ngconsole项目和ngconsole_resources项目必须在同级目录下

## 执行"npm run build"之前，请先确保ngconsole_resources内资源是最新资源

## 在ngconsole_resources项目修改electron资源后，只有在ngconsole项目执行"npm run build"之后，ngconsole项目才会同步资源更新

## 执行"npm run watch"实时监测文件修改并编译代码，但资源并不会同步更新，只有执行"npm run build"之后才会更新资源