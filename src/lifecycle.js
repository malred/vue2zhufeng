import Watcher from "./observe/watcher"
import { createElementVnode, createTextVnode } from "./vdom"
import { patch, patchProps, createElm } from "./vdom/patch"
export function initLifeCycle(Vue) {
    // 虚拟dom转真实dom
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el
        // console.log('update', vnode)
        // 判断是否是更新操作
        const prevVnode = vm._vnode
        // 把组件第一次产生的虚拟节点保存到vnode上
        vm._vnode = vnode
        if (prevVnode) {
            // 之前渲染过了
            // diff更新
            patch(prevVnode, vnode)
        } else {
            // 初始化 
            vm.$el = patch(el, vnode)
        }
    }
    // _c{'div',{},...children}
    Vue.prototype._c = function () {
        // this -> vm
        return createElementVnode(this, ...arguments)
    }
    // _v(text)
    Vue.prototype._v = function () {
        // console.log(...arguments)
        // console.log(...arguments)
        // console.log(createTextVnode(this, ...arguments))
        return createTextVnode(this, ...arguments)
    }
    Vue.prototype._s = function (value) {
        // console.log(value)
        // 插值表达式里的值(zs)如果不是对象,就直接返回 
        if (typeof value !== 'object') return value
        // 如果是对象,就转字符串    
        return JSON.stringify(value)
    }
    // 渲染虚拟dom
    Vue.prototype._render = function () {
        // console.log('render')
        // const vm = this 
        // 让with里的this指向vm
        // 此时可以视图和属性进行绑定
        return this.$options.render.call(this) // ast语法转义后生成的render
    }
}
// 组件挂载
export function mountComponent(vm, el) {
    // 把要被挂载的真实dom,放到vm实例上
    vm.$el = el // 这个el是querySelector获取了的
    // 1,调用render方法产生虚拟节点,虚拟dom
    // 2,根据虚拟dom生成真实dom 
    // 3,插入el元素
    // 创建watcher
    const updateComponent = () => {
        vm._update(vm._render())
    }
    // debugger
    new Watcher(vm, updateComponent, true) // true用于标识这是一个渲染watcher
    // console.log(watcher)
    // 改为在Watcher创建时调用,进行初次渲染
    // vm._update(vm._render()) // vm.$options.render 返回虚拟节点
}
// vue核心流程: 1,创建响应式数据 2,模板转化为ast语法树
    // 3,将ast转换为render函数 4,后续每次更新可以只执行render函数(无需再次执行ast转换)
    // render函数会产生虚拟节点(使用响应式数据)
    // 根据生成的虚拟dom创造真实dom