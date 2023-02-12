const strats = {}
const LIFECYCLE = [
    'beforeCreate',
    'create'
]
LIFECYCLE.forEach(hook => {
    strats[hook] = function (p, c) {
        if (c) {
            // 如果儿子有,父亲有,就拼在一起
            if (p) {
                return p.concat(c)
            } else {
                return [c] // 儿子有,父亲没有,则将儿子包装为数组
            }
        } else {
            return p // 如果儿子没有,则用父亲即可
        }
    }
})
// 解决全局和局部声明同一组件的情况 
strats.components = function (parentValue, childValue) {
    const res = Object.create(parentValue)
    if (childValue) {
        for (let key in childValue) {
            // 返回的是构造的对象,可以拿到父亲身上的属性,并且将儿子的都拷贝到自己身上
            res[key] = childValue[key]
        }
    }
    return res
}
export function mergeOptions(p, c) {
    const options = {}
    for (let key in p) {
        // 获取老的
        margeField(key)
    }
    for (let key in c) {
        if (!p.hasOwnProperty(key)) {
            margeField(key)
        }
    }
    function margeField(key) {
        // 用策略模式减少if/else
        if (strats[key]) { 
            options[key] = strats[key](p[key], c[key])
        } else {
            // 不在策略中,则以儿子为主
            options[key] = c[key] || p[key]
        }
    }
    return options
}