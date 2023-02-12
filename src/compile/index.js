import { parseHTML } from "./parse"
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配 {{}} 
function gen(node) {
    // 节点直接生成
    if (node.type === 1) {
        return codegen(node)
    } else {
        // 文本
        let text = node.text
        // 有可能是{{}}或纯文本
        if (!defaultTagRE.test(text)) { // 纯文本
            // stringify是为了加上'',让传入的值变成字符串
            return `_v(${JSON.stringify(text)})`
        } else { // 带插值表达式
            // {{name}}hello => _v(_s(name)+'hello')
            // console.log(text)
            let tokens = []
            // 捕获文本
            let match
            // 如果正则里有g,则再次exec会从上次匹配到的位置开始往后找
            // 重置正则匹配的起始位置
            defaultTagRE.lastIndex = 0
            let lastIndex = 0 // 记录上一次匹配的最后一位
            while (match = defaultTagRE.exec(text)) {
                // console.log(match)
                let index = match.index // 拿到匹配到字符({{)的开始索引
                if (index > lastIndex) {
                    // {{name}} hello {{age}} => hello
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`) // 插值表达式里的变量名
                // {{name}} xxx {{age}} -> 0 + name}}.length => 8
                // 下一次匹配到,就可以查看两次匹配中间有没有值 ({{name}} hello {{age}} => hello)
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                // {{name}} hello {{age}} world => world
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            // console.log(tokens, `_v(${tokens.join("+")})`)
            return `_v(${tokens.join("+")})`
        }

    }
}
function genChildren(children) {
    return children.map(child => gen(child)).join(',')
}
// 生成属性str的方法
function genProps(attrs) {
    let str = '' // {name,value}
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            // color:red => {color:'red'}
            let obj = {}
            // color: xxx;font-weight:xxx 多个用;分开
            attr.value.split(';').forEach(item => {
                // color: xxx 单个用:分开
                let [key, value] = item.split(':')
                obj[key] = value // 给obj赋值
            });
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    // slice(开始,结尾),如果是负数则从末尾开始
    // 这里从0取到-1的字符,去掉了最后一个 ,
    return `{${str.slice(0, -1)}}`
}
function codegen(ast) {
    // 解析children
    let children = genChildren(ast.children)
    let code = (`_c('${ast.tag}', ${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'} ${ast.children.length ? `,${children}` : ''})`)
    // console.log(code)
    return code
}
// 编译模板
export function compileToFunction(template) {
    // console.log(template)
    // 1,将template转化为ast语法树
    let ast = parseHTML(template)
    // 2,生成render方法,render方法执行返回的结果就是虚拟dom
    // render(){ 把树组装成这样
    //     return _c('div', { id: 'app' },_c('div', { color: 'blue' }, _v(_s(name) + 'hello')
    //         , _c('span', null, _v(_s(age) + 'hello'))))
    // }
    // console.log(ast)
    // 生成代码 (模板引擎的实现原理就是 with + new Function)
    let code = codegen(ast)
    // console.log(this)
    // with会从传进来的参数里取值,这里的this是调用者
    code = `with(this){return ${code}}`
    // console.log(code)
    // 根据代码自动生成函数
    let render = new Function(code)
    // console.log(render.toString())
    // function render(
    // ) {
    //     // 关闭严格模式才能用with
    //     with (this) { return _c('div', { id: "app", style: { "color": "skyblue", "background": " yellow" }, show: true }, _c('div', null, _v(_s(age) + "hello" + _s(name) + "world")), _c('br', null, _v("world"), _c('br', null, _c('span', null, _v(_s(age)))))) }
    // }
    // console.log(render.call(vm))
    return render
}

// with (vm) {
    // 传this,则vm的属性会给this
    // name => this.name => vm.name => vm.data.name
//     // 此时,name就是vm.name
// log name
// }