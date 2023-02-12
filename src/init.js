import { initState } from "./state"
import { compileToFunction } from "./compile"
import { mountComponent } from "./lifecycle"
import {  mergeOptions } from "./utils"
// 提供给vue来使用(此时全局还没有vue对象,所以没办法直接挂载)
export function initMixin(Vue) {
    // 初始化操作
    Vue.prototype._init = function (options) {
        // debugger
        // 将用户传入的options挂载到vue对象上
        const vm = this // 原型中的this表示实例
        // vm.$options = options // $xxx 表示是vue的属性(在(vue里,如果data里的变量名是$开头,vue是拿不到的)
        vm.$options = mergeOptions(this.constructor.options, options) // $xxx 表示是vue的属性(在(vue里,如果data里的变量名是$开头,vue是拿不到的)
        // 初始化状态
        // console.log(vm.$options)
        initState(vm)
        // callHook(vm, 'created')     
        if (options.el) {
            vm.$mount(options.el)
        }
    }
    // 渲染模板的操作
    Vue.prototype.$mount = function (el) {
        // console.log(el)
        const vm = this
        // 获取el对应的dom
        el = document.querySelector(el)
        // console.log(el);
        let ops = vm.$options
        if (!ops.render) { // 先看有没有render函数
            let template // 没有render就看看有没有template
            // 如果用户没有使用了render函数
            if (!ops.template && el) { // 没有写模板,但是写了el
                /*
                    1）innerHTML:
                    从对象的起始位置到终止位置的全部内容,不包括Html标签。
                    2）outerHTML:
                    除了包含innerHTML的全部内容外, 还包含对象标签本身。
                */
                template = el.outerHTML  // outerHTML在火狐下可能不兼容
            } else {
                // if (el) {
                    // console.log(el) 
                    // 写了template,就用用户的template
                    template = ops.template
                // }
            }
            // console.log(template)
            if (template) {
                // 对模板进行编译
                const render = compileToFunction(template)
                ops.render = render
            }
        }
        // console.log(ops.render)// 最终获取render方法
        // 组件挂载
        mountComponent(vm, el)
        // script标签引用的vue.global.js,这个过程是在浏览器运行的
        // runtime是不包含模板编译的,整个编译是打包时通过loader来转义vue文件的,用runtime时不能使用template
    }
}

