// 引入fs模块读取文件内容
const fs = require('fs')
// 引入path模块获取文件路径
const path = require('path')
// 引入babel/parser来进行AST转换
const parser = require('@babel/parser')
// 引入babel/traverse的默认导出 对AST进行过滤解析
const tarverse = require('@babel/traverse').default
// 引入@babel/core中的transformFromAst API 把AST做转换
const { transformFromAst }  = require('@babel/core')

module.exports = {
  // 分析模块 获得AST
  getAST:(fileName) => {
    //! 1.分析入口，读取入口模块的内容
    let content = fs.readFileSync(fileName, 'utf-8')
    // console.log(content)
    // 接受字符串模板，也就是content
    return parser.parse(content, {
      // ESModule形式导入的模块
      sourceType: 'module'
    })
  },

  // 拿到依赖 两个路径
  getDependencies:(AST, fileName) => {
     // 用来存放依赖路径的数组，
    // const denpendcies = []
    // 改成对象，可以保留相对路径和根路径
    const dependencies = {}

    tarverse(AST, {
      ImportDeclaration({node}) {
        const dirname = path.dirname(fileName)
        // node.source.value.replace('.', dirname)
        const newPath = "./" + path.join(dirname, node.source.value)
        dependencies[node.source.value] = newPath
      }
    })
    return dependencies
  },
  // AST转code
  getCode: (AST) => {
    const { code } = transformFromAst(AST, null, {
      presets: ['@babel/preset-env']
    })
    return code
  }
}