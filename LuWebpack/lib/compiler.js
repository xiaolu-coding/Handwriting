const {
  getAST,
  getDependencies,
  getCode
} = require('./parse')
const path = require('path')
const fs = require('fs')

// Webpack启动函数
module.exports = class Compiler {
  // options为webpack配置文件的参数，因此可以获取到一系列配置，在这保存起来
  constructor(options) {
    // console.log(options)
    // 保存入口
    this.entry = options.entry
    // 保存出口
    this.output = options.output
    console.log(this.output)
    // 保存所有的模块的数组
    this.modules = []

  }

  run() {
    // info接收这些返回
    const info = this.build(this.entry)
    this.modules.push(info)


    for (let i = 0; i < this.modules.length; i++) {
      // 拿到info的信息
      const item = this.modules[i]
      // 解构出来
      const {
        dependencies
      } = item
      // 如果不为空，代表有依赖，就要递归去解析这些依赖的模块
      if (dependencies) {
        for (let j in dependencies) {
          // 把路径传进去就ok了，递归遍历了
          // 然后把返回的info又push进modules数组
          this.modules.push(this.build(dependencies[j]))
        }
      }
    }

    // 转换数据结构 将数组对象转换成对象形式
    const obj = {}
    this.modules.forEach(item => {
      // 就是将fileName作为key dependencied和code作为value
      obj[item.fileName] = {
        dependencies: item.dependencies,
        code: item.code
      }

    })
    // 然后obj就是转换后的对象了

    this.file(obj)
  }
  // 解析
  build(fileName) {
    // 解析获取AST
    let AST = getAST(fileName)
    // 获取AST中的依赖路径和根路径，保存在对象的key, value中
    let dependencies = getDependencies(AST, fileName)
    // 将AST转为code
    let code = getCode(AST)
    return {
      // 返回文件名
      fileName,
      // 返回依赖对象
      dependencies,
      // 返回代码
      code
    }
  }
  // 转换成浏览器可执行的文件
  file(code) {
    // 获取输出信息  拼接出输出的绝对路径 this.output是传入的options
    const filePath = path.join(this.output.path, this.output.filename)
    // console.log(filePath)
    const newCode = JSON.stringify(code)
    // 写一个类似于打包后的自执行函数的函数
    // code为传入的对象参数
    const bundle = `(function(graph){
      function require(module) {

        function localRequire(relativePath) {
          return require(graph[module].dependencies[relativePath])
        }
        
        var exports = {};
        (function(require, exports, code){
          eval(code)
        })(localRequire, exports, graph[module].code)

        return exports
      }
      require('${this.entry}')
    })(${newCode})`
    // console.log(bundle)
    // 创建dist目录
    let path1 = this.output.path
    fs.exists(this.output.path, function (exists) {
      if (exists) {
        // 在对应路径下创建文件 bundle为文件内容
        fs.writeFileSync(filePath, bundle, 'utf-8')
        return
      } else {
        fs.mkdir(path1, (err) => {
          if (err) {
            console.log(err)
            return false
          }
        })
        // 在对应路径下创建文件 bundle为文件内容
        fs.writeFileSync(filePath, bundle, 'utf-8')
      }
     
    })

    





  }
}