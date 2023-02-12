import { mergeOptions } from "./utils"

export function initGlobalAPI(Vue) {
    Vue.options = {
        // Vue构造函数挂到全局
        _base: Vue
    }
    Vue.mixin = function (mixin) {
        this.options = mergeOptions(this.options, mixin)
        return this
    }
    // console.log(Vue.options);
    Vue.extend = function (options) {
        // console.log(options);
        function Sub(options = {}) { // 最终使用一个组件,就是new一个实例
            // console.log(options,Sub.options);
            // options = mergeOptions(Sub.options,options)
            this._init(options) // 默认对子类进行初始化操作
            // console.log(this._init,this.$mount);
        }
        // 子类可以找到父类原型 Sub.prototype.__proto__ = Vue.prototype
        Sub.prototype = Object.create(Vue.prototype) // object.create 但是此时Sub的构造器用的是父类的
        // console.log(Vue.prototype, Sub.prototype,Object.create(Vue.prototype));
        Sub.prototype.constructor = Sub
        // console.log(Sub.prototype.__proto__);
        // Sub.prototype.__proto__ = Vue.prototype
        Sub.options = mergeOptions(Vue.options, options) // 保存用户传的选项
        return Sub
    }
    // 声明全局组件
    Vue.options.components = {}
    Vue.component = function (id, definition) {
        // 如果definition是函数,说明用户调用了extend()
        definition =
            typeof definition === 'function' ? definition : Vue.extend(definition)
        Vue.options.components[id] = definition
        // console.log(Vue.options.components);
    }
}