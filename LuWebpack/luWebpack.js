// 获取配置信息
const options = require('./webpack.config')
// 获取Compiler类 通过其保存配置信息和执行构建
const Compiler = require('./lib/compiler')
// 通过options创建compiler，并执行run启动函数
new Compiler(options).run()

