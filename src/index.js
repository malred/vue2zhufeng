import { initGlobalAPI } from "./globalApi"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle" 
import { initStateMixin } from "./state" 
// class会把所有方法耦合在一起
function Vue(options) { // options就是用户提供的选项 
    this._init(options) // 初始化 
    // if (options.el) this.$mount(options.el) // 挂载
}
// debugger
initMixin(Vue)
initLifeCycle(Vue) // 组件渲染
initGlobalAPI(Vue)
initStateMixin(Vue)
// test
/*
// let render1 = compileToFunction(`<li key="b" b='1' style="color: red">{{name}}</li>`)
// let render1 = compileToFunction(`<li key="b" b='1' style="color: red"></li>`)
// let render1 = compileToFunction(`<ul style="color: red">
//     <li key="a">a</li>
//     <li key="b">b</li>
//     <li key="c">c</li>
// </ul>`)
// let render1 = compileToFunction(`<ul style="color: red">
//     <li key="a">a</li>
//     <li key="b">b</li>
//     <li key="c">c</li>
//     <li key="d">d</li>
// </ul>`)
let render1 = compileToFunction(`<ul style="color: red">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>  
    <li key="d">d</li>
</ul>`)
let vm1 = new Vue({ data: { name: "zf" } })
let prevVnode = render1.call(vm1)
// console.log(prevVnode);
let el = createElm(prevVnode)
document.body.appendChild(el)
// let render2 = compileToFunction(`<span key="a" style="color: red;background: blue">{{name}}</span>`)
// let render2 = compileToFunction(`<li key="a" style="color: red;background: blue">{{name}}</li>`)
// let render2 = compileToFunction(`<li key="b" a='1' style="color: red;background: blue">{{name}}</li>`)
// let render2 = compileToFunction(`<li key="b" a='1' style="color: red;background: blue"></li>`)
// let render2 = compileToFunction(`<li key="b" a='1' style="color: red;background: blue"><div>1<span>2</span></div>{{name}}</li>`)
// let render2 = compileToFunction(`<ul style="color: red;background: blue">
//     <li key="a">a</li>
//     <li key="b">b</li>
//     <li key="c">c</li>
//     <li key="d">d</li>
// </ul>`)
// let render2 = compileToFunction(`<ul style="color: red;background: blue">
//     <li key="a">a</li>
//     <li key="b">b</li>
//     <li key="c">c</li> 
// </ul>`)
// let render2 = compileToFunction(`<ul style="color: red;background: blue">
//     <li key="d">d</li>
//     <li key="a">a</li>
//     <li key="b">b</li>
//     <li key="c">c</li> 
// </ul>`)
// let render2 = compileToFunction(`<ul style="color: red;background: blue">
//     <li key="d">d</li>
//     <li key="c">c</li> 
//     <li key="b">b</li>
//     <li key="a">a</li>
// </ul>`)
let render2 = compileToFunction(`<ul style="color: red;background: blue">  
    <li key="b">b</li>
    <li key="m">m</li>
    <li key="a">a</li>
    <li key="p">p</li>   
    <li key="c">c</li>  
    <li key="q">q</li>
</ul>`)
let vm2 = new Vue({ data: { name: "zf" } })
let nextVnode = render2.call(vm2)
// console.log(nextVnode);
let newEl = createElm(nextVnode)
// 暴力替换, 如果用户一直创建并操作dom, 会很耗性能
// diff算法平级进行比较,如果相同就不修改
setTimeout(() => {
    // el.parentNode.replaceChild(newEl, el)
    patch(prevVnode, nextVnode)
}, 1000); */
export default Vue