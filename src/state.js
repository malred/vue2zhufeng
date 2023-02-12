import { initMixin } from "./init"
import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher, { nextTick } from "./observe/watcher"

// 对options内属性和方法进行操作 
export function initState(vm) {
    const opts = vm.$options
    // debugger
    if (opts.data) {
        // data数据的初始化
        initData(vm)
    }
    // console.log(vm.$options)
    if (opts.computed) {
        // 计算属性初始化
        initComputed(vm)
    } if (opts.watch) {
        // watch的初始化
        initWatch(vm)
    }
}
// 代理取值和设置值,通过响应式的方法来改变实际操作的值
function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            // 返回vm[_data][key] (vm._data.key)
            return vm[target][key]
        },
        set(newValue) {
            if (newValue === vm[target][key]) {
                return
            }
            vm[target][key] = newValue
        }
    })
}
// 数据初始化(转为响应式)
function initData(vm) {
    let data = vm.$options.data
    // 如果data是函数,就调用并获取其返回值
    data = typeof data === 'function' ? data.call(this) : data
    // data挂载到vm上
    vm._data = data
    // debugger
    // 数据劫持 
    observe(data) // 监听数据变化
    // 将vm._data代理,则用户操作值只需要vm.xxx(而不是vm._data.xxx)
    for (let key in data) {
        proxy(vm, '_data', key)
    }
}
// 计算属性初始化
function initComputed(vm) {
    // 拿到用户定义的计算属性(有两种写法)
    const computed = vm.$options.computed
    // console.log(computed)
    // 挂载到vm
    let watchers = vm._computedWatchers = {} // 保存不同计算属性的watcher
    // 拿到computed里定义的计算属性
    for (let key in computed) {
        let userDef = computed[key]
        // 缓存
        // 需要监控计算属性中get(依赖的属性)的变化
        let fn = typeof userDef === 'function' ? userDef : userDef.get
        // 直接new,会走fn,所以用lazy来标识不需要立刻执行fn
        watchers[key] = new Watcher(vm, fn, { lazy: true }) // 将计算属性和watcher对应起来
        defineComputed(vm, key, userDef)
    }
}
// 定义计算属性
function defineComputed(target, key, userDef) {
    // 判断计算属性是函数还是对象
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    const setter = userDef.set || (() => { })
    // console.log(getter, setter)
    // 可以通过实例(target[vm])获取对应属性 
    Object.defineProperty(target, key, {
        // this指向vm 
        get: createComputedGetter(key),
        set: setter
    })
}
// 注意: 计算属性不会收集依赖,只会让自己的依赖属性去收集依赖
// 包装一下getter,判断是不是重复get了
function createComputedGetter(key) {
    // 检测是否要执行getter
    return function () {
        // this指向vm
        // 拿到对应属性的watcher (计算属性watcher)
        // console.log(this, key) 
        const watcher = this._computedWatchers[key]
        if (watcher.dirty) {
            // 如果是dirty,就执行用户传入的函数
            watcher.evaluate() // 调用完会设置dirty为false
        }
        if (Dep.target) {
            // 计算属性出栈后,还要渲染,需要记录渲染watcher来更新视图
            watcher.depend()
        }
        // console.log(this.value)
        return watcher.value // 返回watcher上的值
    }
}
function initWatch(vm) {
    let watch = vm.$options.watch
    // console.log(watch)
    for (let key in watch) {
        // 三种情况: 字符串,数组,函数 (其实也可以是对象,但是这里不考虑)
        const handler = watch[key]
        // 如果是数组
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        } else {
            // 如果不是数组
            createWatcher(vm, key, handler)
        }
    }
}
// 创建watch
function createWatcher(vm, key, handler) {
    // 字符串,数组,函数
    if (typeof handler === 'string') {
        handler = vm[handler]
    }
    return vm.$watch(key, handler)
}
export function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick // 统一暴露给外部的更新方法
    initMixin(Vue) // 拓展了vue,添加init方法 
    Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
        // console.log(exprOrFn, cb, options)
        // exprOrFn可能是函数(返回一个函数),也有可能是字符串
        // cb是watch监测的值变化时触发的函数
        new Watcher(this, exprOrFn, { user: true }, cb)
    }
}