import Dep, { popTarget, pushTarget } from "./dep"
let id = 0 // 唯一标识watcher
// 1,渲染watcher时,把当前渲染的watcher放到dep.target
// 2,调用_render() 会取值,走到属性的get上
class Watcher { // 不同组件有不同的watcher
    // 传入vm和更新方法
    constructor(vm, exprOrFn, options, cb) {
        // console.log(fn)
        this.id = id++
        this.renderWatcher = options // 是一个渲染watcher
        this.cb = cb // 获取用户定义的watch回调|处理逻辑
        if (typeof exprOrFn == "string") {
            // 字符串
            this.getter = function () {
                return vm[exprOrFn] // vm.xxx
            }
        } else {
            this.getter = exprOrFn // getter意味着调用这个函数可以发生取值操作
        }
        this.deps = [] // 后续实现计算属性和清理工作用得到
        this.depIds = new Set() // 保存dep的id(多个),set集合可以去重
        this.lazy = options.lazy // 是否立刻执行fn
        this.dirty = this.lazy // 标记脏,是否第一次执行
        this.vm = vm
        // 拿到初始值
        this.value = this.lazy ? undefined : this.get() // init get
        this.user = options.user// 标识是不是用户自己的watch
    }
    addDep(dep) { // 一个组件有多个属性,重复的不用记录
        let id = dep.id
        if (!this.depIds.has(id)) {
            // watcher记录dep
            this.deps.push(dep)
            this.depIds.add(id)
            // 此时让dep记录watcher
            dep.addSub(this)
        }
    }
    evaluate() {
        // 用户传入的get方法 
        // console.log(this)
        this.value = this.get() // 用户get函数的返回值 
        this.dirty = false // 如果再次取值,则state.js里的判断会false,不会再次触发this.get
    }
    // 更新
    get() {
        pushTarget(this)
        // Dep.target = this // 当前的watcher给dep
        let value = this.getter.call(this.vm) // 会从vm上取值
        // console.log(value)
        // console.log(this.getter)
        popTarget()
        // Dep.target = null // 渲染完清空
        return value // 计算属性执行的是用户传入的getter,返回值就是计算属性的值
    }
    depend() {
        let i = this.deps.length
        while (i--) {
            // dep.depend()
            // dep依赖渲染watcher和计算属性watcher,都需要收集
            this.deps[i].depend() // 让计算属性watcher也收集渲染watcher
        }
    }
    update() {
        if (this.lazy) {
            // 如果是计算属性,依赖的值变化了,会触发计算属性watcher的update方法
            this.dirty = true // 标记为true,可以更新(state.js)
            // console.log(1) 
            return
        }
        // 多次更新同一个数据,则应该用队列记录,只更新最后一次
        queryWatcher(this) // 暂存watcher
        // this.get() // 重新渲染
    }
    run() {
        let oldValue = this.value
        // 此时最终的vm.name已经赋值完毕(ls5),更新时取值,就是最后的这个值
        let newVal = this.get()
        if (this.user) {
            // watch调用用户定义的处理逻辑
            this.cb.call(this.vm, newVal, oldValue)
        }
    }
}
// 需要给每个属性添加一个dep,目的是收集watcher
// 一个组件中,有多个属性(n个属性对应一个视图) n个dep对应一个watcher
// 一个属性,对应多个组件,一个dep对应多个watcher
// 多对多
let queue = [] // 源码是用set来去重
// 这里使用对象来去重
let has = {}
let pending = false // 防抖
// 等待一段时间后进入该方法,一次性更新
function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    // 刷新过程中,可能也有新的watcher,可以重新放到queue
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(q => q.run())
}
function queryWatcher(watcher) {
    const id = watcher.id
    if (!has[id]) {
        // 没有重复,直接放入队列
        queue.push(watcher)
        has[id] = true
        // console.log(queue)
    }
    // 不管update多少次,最终只执行一轮刷新操作
    if (!pending) {
        setTimeout(flushSchedulerQueue, 0);
        pending = true
    }
}
// 用户更新队列
let callbacks = []
let waiting = false
// 异步批处理
function flushCallbacks() {
    let cbs = callbacks.slice(0)
    waiting = false
    callbacks = []
    cbs.forEach(cb => cb())
}
let timerFunc
// 有bug,promise拿到的还是老的
// if (Promise) { // 判断有没有promise(可以转字符串看是不是原生promise)
//     // console.log('Promise')
//     timerFunc = () => {
//         Promise.resolve().then(flushCallbacks)
//     }
// } else if (MutationObserver) {
//     // 这里传入的回调是异步的
//     let observe = new MutationObserver(flushCallbacks)
//     // 监控文本变化
//     let textNode = document.createTextNode(1)
//     observe.observe(textNode, {
//         characterData: true,
//     })
//     timerFunc = () => {
//         textNode.textContent = 2
//     }
// } else if (setImmediate) {
//     timerFunc = () => {
//         setImmediate(flushCallbacks)
//     }
// } else {
//     timerFunc = () => {
//         setTimeout(flushCallbacks)
//     }
// }
// 暴露给外部的更新方法
// vue里的nextTick不是用api(定时器...),而是采用优雅降级的方式
// 降级: promise(ie不兼容) => MutationObserver(h5的api) => setImmediate(ie专用) => setTimeout
export function nextTick(cb) {
    // 先用户还是先内部更新 ? => 看用户更新方法在前,还是数据变化在前
    // 定时器耗性能,promise执行比定时器快
    callbacks.push(cb)
    if (!waiting) {
        setTimeout(() => {
            flushCallbacks()
        }, 0)
        // timerFunc(flushCallbacks) 
        // timerFunc() // 执行的就是flushCallbacks
        waiting = true
    }
}
export default Watcher