// rollup默认可以导出一个对象,作为打包的配置文件
// import babel from 'rollup-plugin-babel' // es6导入语法
const babel = require('rollup-plugin-babel')
const resolve = require('@rollup/plugin-node-resolve')
// export default {
module.exports = {
    input: './src/index.js', // 入口
    output: {
        file: './dist/vue.js', // 出口
        name: 'Vue', // 打包后全局添加Vue对象 global Vue
        format: 'umd', // esm es6模块 commonjs模块 iife自执行函数 umd通用模块规范(兼容AMD和commonjs,iife,不兼容es6)
        sourcemap: true, // 可以调试源代码
        strict: false
    },
    // 可以使用的插件
    plugins: [
        babel({
            exclude: 'node_modules/**' // 排除nodemodule下所有文件
        }),
        resolve() // import xx from 'xxx/index' -> 'xxx'
    ]
}