// 重写数组部分方法
let oldArrayProto = Array.prototype // 获取数组的原型
// newArrayProto = oldArrayProto 拿到了旧原型
export let newArrayProto = Object.create(oldArrayProto)
// 重写
let methods = [ // 找到所有的变异方法(可以修改数组的方法)
    // push 将新元素添加到数组的末尾，并返回新的长度
    // pop 删除数组的最后一个元素，并返回该元素 
    // shift 移除数组的第一项 
    // unshift 将新元素添加到数组的开头，并返回新的长度
    // reverse 反转数组中元素的顺序 
    // sort 排序
    // splice 从数组中添加/删除元素
    'push', 'pop',
    'shift', 'unshift',
    'reverse',
    'sort',
    'splice'
]
methods.forEach(method => {
    // arr.push(1,2,3)
    // 重写方法
    newArrayProto[method] = function (...args) {
        // 调用
        // 内部调用原方法,函数的劫持,切片编程
        const result = oldArrayProto[method].call(this, ...args) // 保留旧方法的逻辑 
        // 对新增的数据再次进行劫持
        let inserted // 是一个数组
        let ob = this.__ob__ // 挂载在data的observer实例,可以使用其更新方法
        switch (method) {
            case 'unshift':
            case 'push':
                inserted = args
                break
            case 'splice': // splice(开始位置,结束位置,{新增数据},{新增数据})
                // 获取新增的数据
                inserted = args.slice(2) // 去掉前两个,拿到剩下的
                break
            default:
                break
        }
        // console.log(inserted)
        if (inserted) {
            // console.log(this)
            // 数组转响应式
            this.__ob__.observeArray(inserted)
        }
        // 数组变化,更新依赖收集
        ob.dep.notify()
        return result
    }
})