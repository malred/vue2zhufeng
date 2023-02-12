// 虚拟dom操作
// _h() _c()
const isReservedTag = (tag) => { // 判断是不是html中已有的原始标签
    return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag)
}
export function createElementVnode(vm, tag, data, ...children) {
    // console.log(data)
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) delete data.key
    // 如果是原始标签
    console.log(isReservedTag(tag));
    if (isReservedTag(tag)) {
        // console.log(tag);
        return vnode(vm, tag, key, data, children, null)
    } else {
        // 创造虚拟节点
        let Ctor = vm.$options.components[tag] // 拿到组件的构造函数
        console.log(Ctor);
        return createComponentVnode(vm, tag, key, data, children, Ctor)
    }
}
// 创建组件虚拟节点
function createComponentVnode(vm, tag, key, data, children, Ctor) {
    if (typeof Ctor === 'object') {
        // 如果是对象
        /* 
        let Sub = Vue.extend({
            template: '<button>click<my-button></my-button></button>',
            components: {
                'my-button': {
                    template: '<button>click-my-sub</button>'
                }
            }
            // Vue解析组件的template来渲染
        })
        */
        // 拿到构造函数
        Ctor = vm.$options._base.extend(Ctor)
    }
    data.hook = {
        init(vnode) {
            // 组件创建真实节点时调用
            // 保存组件的实例到虚拟节点上
            let instance = vnode.componentInstance = new vnode.componentsOptions.Ctor
            instance.$mount() // instance.$el
        }
    }
    // console.log(Ctor);
    // 创建vnode
    return vnode(vm, tag, key, data, children, null, { Ctor })
}
// _v()
export function createTextVnode(vm, text) {
    // console.log(text)
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}
// ast是语法转换,描述语法(html js css), <div xxx> -> div,xxx=true
// 虚拟dom是描述dom元素,可以增加自定义属性 div.xxx
function vnode(vm, tag, key, data, children, text, componentsOptions) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentsOptions // 组件的构造函数
        // ......
    }
}
// 判断是不是同一个虚拟节点
export function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}
