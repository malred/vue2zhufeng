import { newArrayProto } from "./array"
import Dep from './dep'
// 观察data对象的类
class Observer {
    constructor(data) {
        // data可能是对象或数组
        // 如果对象或数组新增数据,希望也能进行更新,所以给数组或对象本身添加dep
        this.dep = new Dep()

        Object.defineProperty(data, '__ob__', {
            value: this,
            // 如果data是对象,则加上__ob__后,会一直进行响应式处理walk(在构造函数调用了),然后栈溢出
            enumerable: false // 不可枚举,(循环时无法获取)
        })
        // 把observer实例挂载到data,则array.js也可以使用observer的观测数组方法
        // 如果data上有一个__ob__属性,则说明被观测过
        // data.__ob__ = this
        if (Array.isArray(data)) {
            // 如果data是数组
            // 可以保留数组的特性,重写数组的部分方法 7个变异方法 可以修改数组本身
            // data.__proto__ = { // 这样重新指定原型链,会导致数组原有属性和方法的缺失
            //     push() {
            //         // 重写push
            //         console.log('push')
            //     }
            // }
            data.__proto__ = newArrayProto
            this.observeArray(data)
            return
        }
        // Object.defineProperty只能劫持已经存在的属性 (vue里提供了专门的api($set $delete ...)来解决)
        this.walk(data)
    }
    walk(data) { // 循环对象,对属性依次劫持
        // 重新定义属性(vue2的性能瓶颈所在),每个变量都添加get/set监听
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
    // 观测,对数组和数组里的对象进行响应式处理
    observeArray(data) {
        data.forEach(item => observe(item))
    }
}
function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i]
        current.__ob__ && current.__ob__.dep.depend()
        // 如果数组里有数组,而且还有数组,就继续依赖收集
        if (Array.isArray(current)) {
            dependArray(current)
        }
    }
}
// 对象转响应式的方法(重新定义)
export function defineReactive(target, key, value) { // 闭包 属性劫持
    // value可能是一个对象,需要对其进行响应式处理
    let childOb = observe(value) // 递归了,性能也会降低
    // childOb.dep是用来收集依赖的,childOb是observe方法返回的Observe实例对象
    let dep = new Dep() // 此时每个属性都有dep 
    Object.defineProperty(target, key, {
        // 内部使用了外部的变量(value),所以value被保存到闭包
        // 取值时执行
        get() {
            // 在模板里取值时(mount)才会依赖收集(此时有watcher,watcher把dep.target赋值为自己)
            if (Dep.target) {
                // 每个属性的dep是不同的
                dep.depend() // 属性的收集器记住当前watcher
                if (childOb) { // 如果有childOb(非对象和被代理过的不会产生Observer实例)
                    childOb.dep.depend() // (数组或对象)进行依赖收集
                    if (Array.isArray(value)) { // 解决数组嵌套数组无法依赖收集的问题
                        // 如果是数组
                        dependArray(value)
                    }
                }
            }
            return value
        },
        // 修改时执行
        set(newValue) {
            if (newValue === value) return
            observe(newValue) // 设置值时,如果是对象,也需要转响应式!  
            value = newValue
            dep.notify()  // 通知更新
        }
    })
}
export function observe(data) {
    // debugger
    // console.log(data)
    // 如果data不是对象
    if (typeof data !== 'object' || data == null) {
        return // 只对对象进行劫持
    }
    if (data.__ob__ instanceof Observer) {
        // 说明被代理过
        return data.__ob__
    }
    // 对data对象进行劫持
    // 判断是否被劫持 => 通过一个专门的实例来观测判断
    return new Observer(data)
}