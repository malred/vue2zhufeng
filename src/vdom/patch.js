import { isSameVnode } from "."
function createComponent(vnode) {
    let data = vnode.data
    // data变为init方法
    data = data.hook
    if (data) data = data.init
    if (data) {
        data(vnode) // 初始化组件
    }
    if (vnode.componentInstance) {
        return true
    }
    return false
}
export function createElm(vnode) {
    // console.log(vnode);
    if (!vnode) return
    let { tag, data, children, text } = vnode
    if (typeof tag === "string") { // 标签
        // 区分是组件还是元素
        if (createComponent(vnode)) {
            // 组件
            return vnode.componentInstance.$el
        }
        // 创建真实节点
        // 将真实节点挂载到虚拟节点,后续修改就可以通过虚拟节点直接找到真实节点
        vnode.el = document.createElement(tag)
        patchProps(vnode.el, {}, data) // 更新属性 xxx=xxx
        children.forEach(child => {
            // debugger
            // console.log(child)
            if (!child) return
            vnode.el.appendChild(createElm(child)) // 会将组件创建的元素插入到父元素
        })
    } else {
        // console.log(vnode) 文本虚拟节点的tag是undefined
        vnode.el = document.createTextNode(text)
    }
    // debugger
    // console.log(vnode.el)
    return vnode.el
}
export function patchProps(el, oldProps = {}, props = {}) {
    // 老的属性中有,新的没有,要删除老的
    // style
    let oldStyles = oldProps.style || {}
    let newStyles = props.style || {}
    for (let key in oldStyles) {
        if (!newStyles[key]) {
            el.style[key] = ''
        }
    }
    // attributes
    for (let key in oldProps) {
        if (!props[key]) {
            el.removeAttribute(key)
        }
    }
    // 新的覆盖老的
    for (let key in props) {
        if (key === 'style') {
            // 如果是style样式属性
            for (let sytleName in props.style) {
                el.style[sytleName] = props.style[sytleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}
export function patch(oldVNode, vnode) {
    if (!oldVNode) {
        // 组件挂载,没有传el
        return createElm(vnode) // vm.$el 组件渲染的结果
    }
    // 初始化时是传一个真实dom,一个虚拟dom
    const isRealElement = oldVNode.nodeType
    // 初次渲染
    if (isRealElement) {
        const elm = oldVNode // 拿到真实元素
        const parentElm = elm.parentNode // 拿到父元素
        let newElm = createElm(vnode)
        // console.log(newElm)
        parentElm.insertBefore(newElm, elm.nextSibling) // 先插入到当前节点的后面(成为兄弟节点)
        parentElm.removeChild(elm) // 删除老节点 
        return newElm
    } else {
        // 更新时是传两个虚拟dom
        // diff算法
        // console.log(oldVNode, vnode);
        // 1,两个节点不是同一个(key或标签tag不同),则直接更新
        // 2,如果两个节点是同一个,则比较其属性是否有差异(复用老的,更新属性)
        // 3,节点比较完毕,就比较儿子
        // console.log(isSameVnode(oldVNode, vnode));
        // 比较的方法
        return patchVnode(oldVNode, vnode)
    }
}
function patchVnode(oldVNode, vnode) {
    // console.log(!isSameVnode(oldVNode, vnode));
    if (!isSameVnode(oldVNode, vnode)) {
        // 用老节点的父节点进行替换
        let el = createElm(vnode)
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
        return el
    }
    let el = vnode.el = oldVNode.el // 复用老节点的元素    
    // 文本的情况,则比较文本内容
    if (!oldVNode.tag) {
        if (oldVNode.text !== vnode.text) {
            el.textContent = vnode.text // 新的文本,覆盖老文本
        }
    } // 文本的tag是undefined
    // 如果是标签,需要对比标签的属性
    // console.log(1);
    patchProps(el, oldVNode.data, vnode.data)
    // 比较儿子节点 (1,双方都有children;2,只有一方有children)
    let oldChildren = oldVNode.children || {}
    let newChildren = vnode.children || {}
    // console.log(oldChildren, newChildren);
    if (oldChildren.length > 0 && newChildren.length > 0) {
        // console.log(el);
        // 完整diff,需要比较两个人的children
        updateChildren(el, oldChildren, newChildren) // 更新两个人的children
    } else if (newChildren.length > 0) {
        // 没有老的,有新的
        // 直接插入
        mountChildren(el, newChildren)
    } else if (oldChildren.length > 0) {
        // 没有新的,老的有,要删除
        // unmountChildren(el, oldChildren)
        el.innerHTML = '' // 可以循环删除,这里只是图省事
    }
    return el
}
function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i]
        el.appendChild(createElm(child))
    }
}
function updateChildren(el, oldChildren, newChildren) {
    // console.log(el, newChildren, oldChildren);
    // 比较时,为了提高性能,需要优化(push,shift,pop,unshift,reserve,sort)
    // vue2使用双指针的方式比较两个节点,(优化特殊情况: )只要头指针超过尾指针或者重合,就执行更新
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1
    // console.log(oldEndIndex, newEndIndex);
    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]
    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]
    // 为了防止空格干扰,就在parse里去掉空格
    // console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);
    // 特殊情况: 只要最后/或最前的几个节点不同
    let lastEqIndex = 0 // 解决bug(insertBefore)
    let lastEqVnode = null
    // 根据老的列表做映射关系,用新的去找,找到就移动,找不到就添加,最后多余的删除
    function makeIndexByKey(children) {
        let map = {

        }
        children.forEach((child, index) => {
            map[child.key] = index
        })
        return map
    }
    let map = makeIndexByKey(oldChildren)
    console.log(map);
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 排除为undefined的情况
        if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        }
        // 有一方 头指针 > 尾部指针,则停止循环
        // 从头向后比较
        else if (isSameVnode(oldStartVnode, newStartVnode)) {
            // 递归比较
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldChildren[++oldStartIndex] // 向后移动
            newStartVnode = newChildren[++newStartIndex]
            // 比较开头节点
            // console.log(oldStartIndex, oldEndIndex, newStartIndex, newEndIndex);
        }
        // 从尾向前比较
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
            // 最后一次相同后--,则存入的是不相同的元素
            lastEqVnode = oldChildren[lastEqIndex]
            // console.log(lastEqIndex, lastEqVnode);
            oldEndVnode = oldChildren[--oldEndIndex] // 向前移动
            newEndVnode = newChildren[--newEndIndex]
            lastEqIndex = oldEndIndex
        }
        // 交叉比较
        else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // 老的尾 移到 老的头 (insertBefore有移动性,会把旧的移动走)
            el.insertBefore(oldEndVnode.el, oldStartVnode.el)
            // 老的被复用,所以要替换老的
            patchVnode(oldEndVnode, newStartVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        }
        else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // 老的头 移到 老的新尾 (insertBefore有移动性,会把旧的移动走)
            el.insertBefore(oldStartVnode.el, newEndVnode.el.nextSibling)
            // 老的被复用,所以要替换老的
            patchVnode(oldStartVnode, newEndVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else {
            // 乱序比对
            // 如果没有key就直接替换(没办法比较)
            let moveIndex = map[newStartVnode.key] // 如果拿到,则说明是要移动的索引
            if (moveIndex !== undefined) {
                let moveVnode = oldChildren[moveIndex] // 找的对应的虚拟节点,复用
                el.insertBefore(moveVnode.el, oldStartVnode.el)
                oldChildren[moveIndex] = undefined // 表示这个节点已经移动走了(如果是删除会报错)
                patchVnode(moveVnode, newStartVnode) // 比较属性和子节点
            } else {
                // 找不到就创建新的,直接插入到oldStartVnode前 
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            }
            newStartVnode = newChildren[++newStartIndex]
        }
    }
    // console.log(newStartIndex, newEndIndex);
    // 经过上面的比较后,指针都移到了双方最后一个相同的节点的位置,剩下的就是old或new独有的
    // 新的多余的插入
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let childEl = createElm(newChildren[i])
            // 可能是向前或向后追加
            // 根据后一位有无节点来判断是不是向后追加
            // Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
            // let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null // 获取下一个元素
            let anchor = newChildren[newEndIndex + 1] ? lastEqVnode.el : null // 获取下一个元素
            // el.appendChild(childEl) // 添加节点
            // console.log(childEl, anchor);
            el.insertBefore(childEl, anchor) // anchor为null,则认为是appendChild
        }
    }
    // 旧的多余的删除
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            // 排除是undefined的情况,有值才删除
            if (oldChildren[i]) {
                let childEl = oldChildren[i].el
                el.removeChild(childEl)
            }
        }
    }
}