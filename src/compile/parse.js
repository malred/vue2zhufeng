// 正则表达式
// vue3采用的不是正则
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // 解析 <div:xxx> 形式(带命名空间)的标签
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配到的分组是一个开始标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配的是</xxx> 最终匹配到的分组是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性
const startTagClose = /^\s*(\/?)>/ // 匹配 <br/> 这种单标签
// htmlparser2库也可以解析html
/*
{
    tag: 'div',
    type: 1,
    attrs: [{name,age,address}],
    parent: null,
    children:[
        {
                tag: 'span',
                type: 1,
                attrs: [{...}],
                parent: div,
                children:[]
        }
    ]
}
*/
export function parseHTML(html) { // html必定是<开头(vue2的template不能是字符串,但是vue3可以)
    // 定义虚拟dom的节点类型
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stack = [] // 用于存放元素
    let currentParent // 指向栈中最后一个元素
    let root // 标记根节点
    // 创建虚拟dom的节点
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }
    // 最终需要转化为一颗抽象语法树
    function start(tag, attrs) {
        // console.log(tag, attrs, '开始');
        let node = createASTElement(tag, attrs);
        if (!root) {
            // 如果还没有根节点,则该元素就是根节点
            root = node
        }
        if (currentParent) {
            // 如果有当前节点,则当前节点是新节点的parent
            node.parent = currentParent
            // 子节点的parent要变为currentParent
            currentParent.children.push(node)
        }
        stack.push(node) // 放入栈
        currentParent = node // 指针指向栈中最后一个
    }
    function chars(text) {
        // vue2源码是保留最多两个空格
        text = text.replace(/\s/g, '') // 去掉空格
        // console.log(text, '文本');
        // 文本直接放入当前指向的节点的children
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end(tag) {
        // console.log(tag, '结束');
        // 弹出时,其开始标签和文本内容都被加到根结点的children了
        let node = stack.pop() // 弹出最后一个 // 可以校验标签是否合法
        currentParent = stack[stack.length - 1]
    }
    // 截取html字符串
    function advance(n) {
        html = html.substring(n)
        // console.log(html)
    }
    // 匹配是否是开始标签
    function parseStartTag() { 
        const start = html.match(startTagOpen)
        // console.log(start); // {0: '<div', 1: 'div' ,...}
        if (start) {
            const match = {
                // 分组就是标签名
                tagName: start[1],
                attrs: []
            }
            // start[0].length是匹配到的字符串,('<div')
            advance(start[0].length) // 从html删除匹配到的字符串
            // console.log(match) 
            // 只要不是开始标签的结束,就一直循环匹配
            let attr, end
            while (!(end = html.match(startTagClose))
                // 将匹配到的内容存入attr
                && (attr = html.match(attribute))) {
                // 因为已经将匹配的内容存放,所以可以删除匹配的字符串
                advance(attr[0].length)
                // console.log(attr);
                match.attrs.push({
                    name: attr[1],
                    // 因为等号两边可能有空格,所以value可能是attr[3]或[4]或[5]
                    value: attr[3] || attr[4] || attr[5] || true // 如果是disable这种没有 = 的,则值是true
                })
            }
            // 如果有 > 这种结束标签,也要删除
            if (end) {
                advance(end[0].length)
            }
            // console.log(match);
            return match
        }
        // console.log(html);
        return false // 不是开始标签
    }
    // 每解析一个,就把解析的内容从html字符串里删除,html删完就是解析完成
    while (html) {
        // debugger
        // 开头是 <的 而下一个开头则是</的< 所以两个 < 之间就是标签的内容
        // 如果indexof的索引是0,则说明是个开始或结束标签
        // 如果indexof的索引大于0,则说明是文本结束位置
        let textEnd = html.indexOf('<')
        if (textEnd == 0) { 
            const startTagMatch = parseStartTag()
            if (startTagMatch) { // 解析到开始标签
                // console.log(html);
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            // 如果有结束标签
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue
            }
        }
        // 文本内容
        if (textEnd > 0) {
            let text = html.substring(0, textEnd) // 文本内容
            if (text) { // 解析到文本 
                chars(text)
                advance(text.length)
                // console.log(html)
            }
        }
    }
    // console.log(root)
    // console.log(html)
    return root
}