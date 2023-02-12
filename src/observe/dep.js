let id = 0 // 用于唯一标识dep 
class Dep {
    constructor() {
        this.id = id++
        this.subs = [] // 存放当前属性对应的watcher有哪些
    }
    depend() {
        // 不希望加重复的watcher
        // this.subs.push(Dep.target)
        // debugger
        Dep.target.addDep(this) // 让watcher记住dep
    }
    addSub(watcher) {
        // 在watcher里有去重
        this.subs.push(watcher)
    }
    // 更新方法!
    notify() {
        // 让所有watcher更新数据
        this.subs.forEach(watcher => watcher.update())
    }
}
Dep.target = null 
// 这个stack是共用的
// 只有一个watcher时,其实和之前没有差别
// 改为将watcher放入栈,target指向最后放入的watcher
let stack = []
// 渲染前入栈
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
    // console.log(stack)
}
// 渲染后出栈
export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}
export default Dep
