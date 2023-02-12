(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () {
    var strats = {};
    var LIFECYCLE = ['beforeCreate', 'create'];
    LIFECYCLE.forEach(function (hook) {
      strats[hook] = function (p, c) {
        if (c) {
          // 如果儿子有,父亲有,就拼在一起
          if (p) {
            return p.concat(c);
          } else {
            return [c]; // 儿子有,父亲没有,则将儿子包装为数组
          }
        } else {
          return p; // 如果儿子没有,则用父亲即可
        }
      };
    });
    // 解决全局和局部声明同一组件的情况 
    strats.components = function (parentValue, childValue) {
      var res = Object.create(parentValue);
      if (childValue) {
        for (var key in childValue) {
          // 返回的是构造的对象,可以拿到父亲身上的属性,并且将儿子的都拷贝到自己身上
          res[key] = childValue[key];
        }
      }
      return res;
    };
    function mergeOptions(p, c) {
      var options = {};
      for (var key in p) {
        // 获取老的
        margeField(key);
      }
      for (var _key in c) {
        if (!p.hasOwnProperty(_key)) {
          margeField(_key);
        }
      }
      function margeField(key) {
        // 用策略模式减少if/else
        if (strats[key]) {
          options[key] = strats[key](p[key], c[key]);
        } else {
          // 不在策略中,则以儿子为主
          options[key] = c[key] || p[key];
        }
      }
      return options;
    }

    function initGlobalAPI(Vue) {
      Vue.options = {
        // Vue构造函数挂到全局
        _base: Vue
      };
      Vue.mixin = function (mixin) {
        this.options = mergeOptions(this.options, mixin);
        return this;
      };
      // console.log(Vue.options);
      Vue.extend = function (options) {
        // console.log(options);
        function Sub() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          // 最终使用一个组件,就是new一个实例
          // console.log(options,Sub.options);
          // options = mergeOptions(Sub.options,options)
          this._init(options); // 默认对子类进行初始化操作
          // console.log(this._init,this.$mount);
        }
        // 子类可以找到父类原型 Sub.prototype.__proto__ = Vue.prototype
        Sub.prototype = Object.create(Vue.prototype); // object.create 但是此时Sub的构造器用的是父类的
        // console.log(Vue.prototype, Sub.prototype,Object.create(Vue.prototype));
        Sub.prototype.constructor = Sub;
        // console.log(Sub.prototype.__proto__);
        // Sub.prototype.__proto__ = Vue.prototype
        Sub.options = mergeOptions(Vue.options, options); // 保存用户传的选项
        return Sub;
      };
      // 声明全局组件
      Vue.options.components = {};
      Vue.component = function (id, definition) {
        // 如果definition是函数,说明用户调用了extend()
        definition = typeof definition === 'function' ? definition : Vue.extend(definition);
        Vue.options.components[id] = definition;
        // console.log(Vue.options.components);
      };
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
      if (null != _i) {
        var _s,
          _e,
          _x,
          _r,
          _arr = [],
          _n = !0,
          _d = !1;
        try {
          if (_x = (_i = _i.call(arr)).next, 0 === i) {
            if (Object(_i) !== _i) return;
            _n = !1;
          } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
        } catch (err) {
          _d = !0, _e = err;
        } finally {
          try {
            if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
          } finally {
            if (_d) throw _e;
          }
        }
        return _arr;
      }
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
      return arr2;
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== undefined) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }

    var id$1 = 0; // 用于唯一标识dep 
    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);
        this.id = id$1++;
        this.subs = []; // 存放当前属性对应的watcher有哪些
      }
      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          // 不希望加重复的watcher
          // this.subs.push(Dep.target)
          // debugger
          Dep.target.addDep(this); // 让watcher记住dep
        }
      }, {
        key: "addSub",
        value: function addSub(watcher) {
          // 在watcher里有去重
          this.subs.push(watcher);
        }
        // 更新方法!
      }, {
        key: "notify",
        value: function notify() {
          // 让所有watcher更新数据
          this.subs.forEach(function (watcher) {
            return watcher.update();
          });
        }
      }]);
      return Dep;
    }();
    Dep.target = null;
    // 这个stack是共用的
    // 只有一个watcher时,其实和之前没有差别
    // 改为将watcher放入栈,target指向最后放入的watcher
    var stack = [];
    // 渲染前入栈
    function pushTarget(watcher) {
      stack.push(watcher);
      Dep.target = watcher;
      // console.log(stack)
    }
    // 渲染后出栈
    function popTarget() {
      stack.pop();
      Dep.target = stack[stack.length - 1];
    }

    // 重写数组部分方法
    var oldArrayProto = Array.prototype; // 获取数组的原型
    // newArrayProto = oldArrayProto 拿到了旧原型
    var newArrayProto = Object.create(oldArrayProto);
    // 重写
    var methods = [
    // 找到所有的变异方法(可以修改数组的方法)
    // push 将新元素添加到数组的末尾，并返回新的长度
    // pop 删除数组的最后一个元素，并返回该元素 
    // shift 移除数组的第一项 
    // unshift 将新元素添加到数组的开头，并返回新的长度
    // reverse 反转数组中元素的顺序 
    // sort 排序
    // splice 从数组中添加/删除元素
    'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
    methods.forEach(function (method) {
      // arr.push(1,2,3)
      // 重写方法
      newArrayProto[method] = function () {
        var _oldArrayProto$method;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        // 调用
        // 内部调用原方法,函数的劫持,切片编程
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 保留旧方法的逻辑 
        // 对新增的数据再次进行劫持
        var inserted; // 是一个数组
        var ob = this.__ob__; // 挂载在data的observer实例,可以使用其更新方法
        switch (method) {
          case 'unshift':
          case 'push':
            inserted = args;
            break;
          case 'splice':
            // splice(开始位置,结束位置,{新增数据},{新增数据})
            // 获取新增的数据
            inserted = args.slice(2); // 去掉前两个,拿到剩下的
            break;
        }
        // console.log(inserted)
        if (inserted) {
          // console.log(this)
          // 数组转响应式
          this.__ob__.observeArray(inserted);
        }
        // 数组变化,更新依赖收集
        ob.dep.notify();
        return result;
      };
    });

    // 观察data对象的类
    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);
        // data可能是对象或数组
        // 如果对象或数组新增数据,希望也能进行更新,所以给数组或对象本身添加dep
        this.dep = new Dep();
        Object.defineProperty(data, '__ob__', {
          value: this,
          // 如果data是对象,则加上__ob__后,会一直进行响应式处理walk(在构造函数调用了),然后栈溢出
          enumerable: false // 不可枚举,(循环时无法获取)
        });
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
          data.__proto__ = newArrayProto;
          this.observeArray(data);
          return;
        }
        // Object.defineProperty只能劫持已经存在的属性 (vue里提供了专门的api($set $delete ...)来解决)
        this.walk(data);
      }
      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          // 循环对象,对属性依次劫持
          // 重新定义属性(vue2的性能瓶颈所在),每个变量都添加get/set监听
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
        // 观测,对数组和数组里的对象进行响应式处理
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          data.forEach(function (item) {
            return observe(item);
          });
        }
      }]);
      return Observer;
    }();
    function dependArray(value) {
      for (var i = 0; i < value.length; i++) {
        var current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        // 如果数组里有数组,而且还有数组,就继续依赖收集
        if (Array.isArray(current)) {
          dependArray(current);
        }
      }
    }
    // 对象转响应式的方法(重新定义)
    function defineReactive(target, key, value) {
      // 闭包 属性劫持
      // value可能是一个对象,需要对其进行响应式处理
      var childOb = observe(value); // 递归了,性能也会降低
      // childOb.dep是用来收集依赖的,childOb是observe方法返回的Observe实例对象
      var dep = new Dep(); // 此时每个属性都有dep 
      Object.defineProperty(target, key, {
        // 内部使用了外部的变量(value),所以value被保存到闭包
        // 取值时执行
        get: function get() {
          // 在模板里取值时(mount)才会依赖收集(此时有watcher,watcher把dep.target赋值为自己)
          if (Dep.target) {
            // 每个属性的dep是不同的
            dep.depend(); // 属性的收集器记住当前watcher
            if (childOb) {
              // 如果有childOb(非对象和被代理过的不会产生Observer实例)
              childOb.dep.depend(); // (数组或对象)进行依赖收集
              if (Array.isArray(value)) {
                // 解决数组嵌套数组无法依赖收集的问题
                // 如果是数组
                dependArray(value);
              }
            }
          }
          return value;
        },
        // 修改时执行
        set: function set(newValue) {
          if (newValue === value) return;
          observe(newValue); // 设置值时,如果是对象,也需要转响应式!  
          value = newValue;
          dep.notify(); // 通知更新
        }
      });
    }

    function observe(data) {
      // debugger
      // console.log(data)
      // 如果data不是对象
      if (_typeof(data) !== 'object' || data == null) {
        return; // 只对对象进行劫持
      }

      if (data.__ob__ instanceof Observer) {
        // 说明被代理过
        return data.__ob__;
      }
      // 对data对象进行劫持
      // 判断是否被劫持 => 通过一个专门的实例来观测判断
      return new Observer(data);
    }

    var id = 0; // 唯一标识watcher
    // 1,渲染watcher时,把当前渲染的watcher放到dep.target
    // 2,调用_render() 会取值,走到属性的get上
    var Watcher = /*#__PURE__*/function () {
      // 不同组件有不同的watcher
      // 传入vm和更新方法
      function Watcher(vm, exprOrFn, options, cb) {
        _classCallCheck(this, Watcher);
        // console.log(fn)
        this.id = id++;
        this.renderWatcher = options; // 是一个渲染watcher
        this.cb = cb; // 获取用户定义的watch回调|处理逻辑
        if (typeof exprOrFn == "string") {
          // 字符串
          this.getter = function () {
            return vm[exprOrFn]; // vm.xxx
          };
        } else {
          this.getter = exprOrFn; // getter意味着调用这个函数可以发生取值操作
        }

        this.deps = []; // 后续实现计算属性和清理工作用得到
        this.depIds = new Set(); // 保存dep的id(多个),set集合可以去重
        this.lazy = options.lazy; // 是否立刻执行fn
        this.dirty = this.lazy; // 标记脏,是否第一次执行
        this.vm = vm;
        // 拿到初始值
        this.value = this.lazy ? undefined : this.get(); // init get
        this.user = options.user; // 标识是不是用户自己的watch
      }
      _createClass(Watcher, [{
        key: "addDep",
        value: function addDep(dep) {
          // 一个组件有多个属性,重复的不用记录
          var id = dep.id;
          if (!this.depIds.has(id)) {
            // watcher记录dep
            this.deps.push(dep);
            this.depIds.add(id);
            // 此时让dep记录watcher
            dep.addSub(this);
          }
        }
      }, {
        key: "evaluate",
        value: function evaluate() {
          // 用户传入的get方法 
          // console.log(this)
          this.value = this.get(); // 用户get函数的返回值 
          this.dirty = false; // 如果再次取值,则state.js里的判断会false,不会再次触发this.get
        }
        // 更新
      }, {
        key: "get",
        value: function get() {
          pushTarget(this);
          // Dep.target = this // 当前的watcher给dep
          var value = this.getter.call(this.vm); // 会从vm上取值
          // console.log(value)
          // console.log(this.getter)
          popTarget();
          // Dep.target = null // 渲染完清空
          return value; // 计算属性执行的是用户传入的getter,返回值就是计算属性的值
        }
      }, {
        key: "depend",
        value: function depend() {
          var i = this.deps.length;
          while (i--) {
            // dep.depend()
            // dep依赖渲染watcher和计算属性watcher,都需要收集
            this.deps[i].depend(); // 让计算属性watcher也收集渲染watcher
          }
        }
      }, {
        key: "update",
        value: function update() {
          if (this.lazy) {
            // 如果是计算属性,依赖的值变化了,会触发计算属性watcher的update方法
            this.dirty = true; // 标记为true,可以更新(state.js)
            // console.log(1) 
            return;
          }
          // 多次更新同一个数据,则应该用队列记录,只更新最后一次
          queryWatcher(this); // 暂存watcher
          // this.get() // 重新渲染
        }
      }, {
        key: "run",
        value: function run() {
          var oldValue = this.value;
          // 此时最终的vm.name已经赋值完毕(ls5),更新时取值,就是最后的这个值
          var newVal = this.get();
          if (this.user) {
            // watch调用用户定义的处理逻辑
            this.cb.call(this.vm, newVal, oldValue);
          }
        }
      }]);
      return Watcher;
    }(); // 需要给每个属性添加一个dep,目的是收集watcher
    // 一个组件中,有多个属性(n个属性对应一个视图) n个dep对应一个watcher
    // 一个属性,对应多个组件,一个dep对应多个watcher
    // 多对多
    var queue = []; // 源码是用set来去重
    // 这里使用对象来去重
    var has = {};
    var pending = false; // 防抖
    // 等待一段时间后进入该方法,一次性更新
    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0);
      // 刷新过程中,可能也有新的watcher,可以重新放到queue
      queue = [];
      has = {};
      pending = false;
      flushQueue.forEach(function (q) {
        return q.run();
      });
    }
    function queryWatcher(watcher) {
      var id = watcher.id;
      if (!has[id]) {
        // 没有重复,直接放入队列
        queue.push(watcher);
        has[id] = true;
        // console.log(queue)
      }
      // 不管update多少次,最终只执行一轮刷新操作
      if (!pending) {
        setTimeout(flushSchedulerQueue, 0);
        pending = true;
      }
    }
    // 用户更新队列
    var callbacks = [];
    var waiting = false;
    // 异步批处理
    function flushCallbacks() {
      var cbs = callbacks.slice(0);
      waiting = false;
      callbacks = [];
      cbs.forEach(function (cb) {
        return cb();
      });
    }
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
    function nextTick(cb) {
      // 先用户还是先内部更新 ? => 看用户更新方法在前,还是数据变化在前
      // 定时器耗性能,promise执行比定时器快
      callbacks.push(cb);
      if (!waiting) {
        setTimeout(function () {
          flushCallbacks();
        }, 0);
        // timerFunc(flushCallbacks) 
        // timerFunc() // 执行的就是flushCallbacks
        waiting = true;
      }
    }

    // 对options内属性和方法进行操作 
    function initState(vm) {
      var opts = vm.$options;
      // debugger
      if (opts.data) {
        // data数据的初始化
        initData(vm);
      }
      // console.log(vm.$options)
      if (opts.computed) {
        // 计算属性初始化
        initComputed(vm);
      }
      if (opts.watch) {
        // watch的初始化
        initWatch(vm);
      }
    }
    // 代理取值和设置值,通过响应式的方法来改变实际操作的值
    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          // 返回vm[_data][key] (vm._data.key)
          return vm[target][key];
        },
        set: function set(newValue) {
          if (newValue === vm[target][key]) {
            return;
          }
          vm[target][key] = newValue;
        }
      });
    }
    // 数据初始化(转为响应式)
    function initData(vm) {
      var data = vm.$options.data;
      // 如果data是函数,就调用并获取其返回值
      data = typeof data === 'function' ? data.call(this) : data;
      // data挂载到vm上
      vm._data = data;
      // debugger
      // 数据劫持 
      observe(data); // 监听数据变化
      // 将vm._data代理,则用户操作值只需要vm.xxx(而不是vm._data.xxx)
      for (var key in data) {
        proxy(vm, '_data', key);
      }
    }
    // 计算属性初始化
    function initComputed(vm) {
      // 拿到用户定义的计算属性(有两种写法)
      var computed = vm.$options.computed;
      // console.log(computed)
      // 挂载到vm
      var watchers = vm._computedWatchers = {}; // 保存不同计算属性的watcher
      // 拿到computed里定义的计算属性
      for (var key in computed) {
        var userDef = computed[key];
        // 缓存
        // 需要监控计算属性中get(依赖的属性)的变化
        var fn = typeof userDef === 'function' ? userDef : userDef.get;
        // 直接new,会走fn,所以用lazy来标识不需要立刻执行fn
        watchers[key] = new Watcher(vm, fn, {
          lazy: true
        }); // 将计算属性和watcher对应起来
        defineComputed(vm, key, userDef);
      }
    }
    // 定义计算属性
    function defineComputed(target, key, userDef) {
      // 判断计算属性是函数还是对象
      // const getter = typeof userDef === 'function' ? userDef : userDef.get
      var setter = userDef.set || function () {};
      // console.log(getter, setter)
      // 可以通过实例(target[vm])获取对应属性 
      Object.defineProperty(target, key, {
        // this指向vm 
        get: createComputedGetter(key),
        set: setter
      });
    }
    // 注意: 计算属性不会收集依赖,只会让自己的依赖属性去收集依赖
    // 包装一下getter,判断是不是重复get了
    function createComputedGetter(key) {
      // 检测是否要执行getter
      return function () {
        // this指向vm
        // 拿到对应属性的watcher (计算属性watcher)
        // console.log(this, key) 
        var watcher = this._computedWatchers[key];
        if (watcher.dirty) {
          // 如果是dirty,就执行用户传入的函数
          watcher.evaluate(); // 调用完会设置dirty为false
        }

        if (Dep.target) {
          // 计算属性出栈后,还要渲染,需要记录渲染watcher来更新视图
          watcher.depend();
        }
        // console.log(this.value)
        return watcher.value; // 返回watcher上的值
      };
    }

    function initWatch(vm) {
      var watch = vm.$options.watch;
      // console.log(watch)
      for (var key in watch) {
        // 三种情况: 字符串,数组,函数 (其实也可以是对象,但是这里不考虑)
        var handler = watch[key];
        // 如果是数组
        if (Array.isArray(handler)) {
          for (var i = 0; i < handler.length; i++) {
            createWatcher(vm, key, handler[i]);
          }
        } else {
          // 如果不是数组
          createWatcher(vm, key, handler);
        }
      }
    }
    // 创建watch
    function createWatcher(vm, key, handler) {
      // 字符串,数组,函数
      if (typeof handler === 'string') {
        handler = vm[handler];
      }
      return vm.$watch(key, handler);
    }
    function initStateMixin(Vue) {
      Vue.prototype.$nextTick = nextTick; // 统一暴露给外部的更新方法
      initMixin(Vue); // 拓展了vue,添加init方法 
      Vue.prototype.$watch = function (exprOrFn, cb) {
        // console.log(exprOrFn, cb, options)
        // exprOrFn可能是函数(返回一个函数),也有可能是字符串
        // cb是watch监测的值变化时触发的函数
        new Watcher(this, exprOrFn, {
          user: true
        }, cb);
      };
    }

    // 正则表达式
    // vue3采用的不是正则
    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // 解析 <div:xxx> 形式(带命名空间)的标签
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配到的分组是一个开始标签名
    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxx> 最终匹配到的分组是结束标签的名字
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
    var startTagClose = /^\s*(\/?)>/; // 匹配 <br/> 这种单标签
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
    function parseHTML(html) {
      // html必定是<开头(vue2的template不能是字符串,但是vue3可以)
      // 定义虚拟dom的节点类型
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = []; // 用于存放元素
      var currentParent; // 指向栈中最后一个元素
      var root; // 标记根节点
      // 创建虚拟dom的节点
      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ELEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      }
      // 最终需要转化为一颗抽象语法树
      function start(tag, attrs) {
        // console.log(tag, attrs, '开始');
        var node = createASTElement(tag, attrs);
        if (!root) {
          // 如果还没有根节点,则该元素就是根节点
          root = node;
        }
        if (currentParent) {
          // 如果有当前节点,则当前节点是新节点的parent
          node.parent = currentParent;
          // 子节点的parent要变为currentParent
          currentParent.children.push(node);
        }
        stack.push(node); // 放入栈
        currentParent = node; // 指针指向栈中最后一个
      }

      function chars(text) {
        // vue2源码是保留最多两个空格
        text = text.replace(/\s/g, ''); // 去掉空格
        // console.log(text, '文本');
        // 文本直接放入当前指向的节点的children
        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }
      function end(tag) {
        // console.log(tag, '结束');
        // 弹出时,其开始标签和文本内容都被加到根结点的children了
        stack.pop(); // 弹出最后一个 // 可以校验标签是否合法
        currentParent = stack[stack.length - 1];
      }
      // 截取html字符串
      function advance(n) {
        html = html.substring(n);
        // console.log(html)
      }
      // 匹配是否是开始标签
      function parseStartTag() {
        var start = html.match(startTagOpen);
        // console.log(start); // {0: '<div', 1: 'div' ,...}
        if (start) {
          var match = {
            // 分组就是标签名
            tagName: start[1],
            attrs: []
          };
          // start[0].length是匹配到的字符串,('<div')
          advance(start[0].length); // 从html删除匹配到的字符串
          // console.log(match) 
          // 只要不是开始标签的结束,就一直循环匹配
          var attr, _end;
          while (!(_end = html.match(startTagClose))
          // 将匹配到的内容存入attr
          && (attr = html.match(attribute))) {
            // 因为已经将匹配的内容存放,所以可以删除匹配的字符串
            advance(attr[0].length);
            // console.log(attr);
            match.attrs.push({
              name: attr[1],
              // 因为等号两边可能有空格,所以value可能是attr[3]或[4]或[5]
              value: attr[3] || attr[4] || attr[5] || true // 如果是disable这种没有 = 的,则值是true
            });
          }
          // 如果有 > 这种结束标签,也要删除
          if (_end) {
            advance(_end[0].length);
          }
          // console.log(match);
          return match;
        }
        // console.log(html);
        return false; // 不是开始标签
      }
      // 每解析一个,就把解析的内容从html字符串里删除,html删完就是解析完成
      while (html) {
        // debugger
        // 开头是 <的 而下一个开头则是</的< 所以两个 < 之间就是标签的内容
        // 如果indexof的索引是0,则说明是个开始或结束标签
        // 如果indexof的索引大于0,则说明是文本结束位置
        var textEnd = html.indexOf('<');
        if (textEnd == 0) {
          var startTagMatch = parseStartTag();
          if (startTagMatch) {
            // 解析到开始标签
            // console.log(html);
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }
          // 如果有结束标签
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            end(endTagMatch[1]);
            advance(endTagMatch[0].length);
            continue;
          }
        }
        // 文本内容
        if (textEnd > 0) {
          var text = html.substring(0, textEnd); // 文本内容
          if (text) {
            // 解析到文本 
            chars(text);
            advance(text.length);
            // console.log(html)
          }
        }
      }
      // console.log(root)
      // console.log(html)
      return root;
    }

    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配 {{}} 
    function gen(node) {
      // 节点直接生成
      if (node.type === 1) {
        return codegen(node);
      } else {
        // 文本
        var text = node.text;
        // 有可能是{{}}或纯文本
        if (!defaultTagRE.test(text)) {
          // 纯文本
          // stringify是为了加上'',让传入的值变成字符串
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          // 带插值表达式
          // {{name}}hello => _v(_s(name)+'hello')
          // console.log(text)
          var tokens = [];
          // 捕获文本
          var match;
          // 如果正则里有g,则再次exec会从上次匹配到的位置开始往后找
          // 重置正则匹配的起始位置
          defaultTagRE.lastIndex = 0;
          var lastIndex = 0; // 记录上一次匹配的最后一位
          while (match = defaultTagRE.exec(text)) {
            // console.log(match)
            var index = match.index; // 拿到匹配到字符({{)的开始索引
            if (index > lastIndex) {
              // {{name}} hello {{age}} => hello
              tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            tokens.push("_s(".concat(match[1].trim(), ")")); // 插值表达式里的变量名
            // {{name}} xxx {{age}} -> 0 + name}}.length => 8
            // 下一次匹配到,就可以查看两次匹配中间有没有值 ({{name}} hello {{age}} => hello)
            lastIndex = index + match[0].length;
          }
          if (lastIndex < text.length) {
            // {{name}} hello {{age}} world => world
            tokens.push(JSON.stringify(text.slice(lastIndex)));
          }
          // console.log(tokens, `_v(${tokens.join("+")})`)
          return "_v(".concat(tokens.join("+"), ")");
        }
      }
    }
    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
    // 生成属性str的方法
    function genProps(attrs) {
      var str = ''; // {name,value}
      var _loop = function _loop() {
        var attr = attrs[i];
        if (attr.name === 'style') {
          // color:red => {color:'red'}
          var obj = {};
          // color: xxx;font-weight:xxx 多个用;分开
          attr.value.split(';').forEach(function (item) {
            // color: xxx 单个用:分开
            var _item$split = item.split(':'),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];
            obj[key] = value; // 给obj赋值
          });

          attr.value = obj;
        }
        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
      };
      for (var i = 0; i < attrs.length; i++) {
        _loop();
      }
      // slice(开始,结尾),如果是负数则从末尾开始
      // 这里从0取到-1的字符,去掉了最后一个 ,
      return "{".concat(str.slice(0, -1), "}");
    }
    function codegen(ast) {
      // 解析children
      var children = genChildren(ast.children);
      var code = "_c('".concat(ast.tag, "', ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null', " ").concat(ast.children.length ? ",".concat(children) : '', ")");
      // console.log(code)
      return code;
    }
    // 编译模板
    function compileToFunction(template) {
      // console.log(template)
      // 1,将template转化为ast语法树
      var ast = parseHTML(template);
      // 2,生成render方法,render方法执行返回的结果就是虚拟dom
      // render(){ 把树组装成这样
      //     return _c('div', { id: 'app' },_c('div', { color: 'blue' }, _v(_s(name) + 'hello')
      //         , _c('span', null, _v(_s(age) + 'hello'))))
      // }
      // console.log(ast)
      // 生成代码 (模板引擎的实现原理就是 with + new Function)
      var code = codegen(ast);
      // console.log(this)
      // with会从传进来的参数里取值,这里的this是调用者
      code = "with(this){return ".concat(code, "}");
      // console.log(code)
      // 根据代码自动生成函数
      var render = new Function(code);
      // console.log(render.toString())
      // function render(
      // ) {
      //     // 关闭严格模式才能用with
      //     with (this) { return _c('div', { id: "app", style: { "color": "skyblue", "background": " yellow" }, show: true }, _c('div', null, _v(_s(age) + "hello" + _s(name) + "world")), _c('br', null, _v("world"), _c('br', null, _c('span', null, _v(_s(age)))))) }
      // }
      // console.log(render.call(vm))
      return render;
    }

    // with (vm) {
    // 传this,则vm的属性会给this
    // name => this.name => vm.name => vm.data.name
    //     // 此时,name就是vm.name
    // log name
    // }

    // 虚拟dom操作
    // _h() _c()
    var isReservedTag = function isReservedTag(tag) {
      // 判断是不是html中已有的原始标签
      return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag);
    };
    function createElementVnode(vm, tag, data) {
      // console.log(data)
      if (data == null) {
        data = {};
      }
      var key = data.key;
      if (key) delete data.key;
      // 如果是原始标签
      console.log(isReservedTag(tag));
      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }
      if (isReservedTag(tag)) {
        // console.log(tag);
        return vnode(vm, tag, key, data, children, null);
      } else {
        // 创造虚拟节点
        var Ctor = vm.$options.components[tag]; // 拿到组件的构造函数
        console.log(Ctor);
        return createComponentVnode(vm, tag, key, data, children, Ctor);
      }
    }
    // 创建组件虚拟节点
    function createComponentVnode(vm, tag, key, data, children, Ctor) {
      if (_typeof(Ctor) === 'object') {
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
        Ctor = vm.$options._base.extend(Ctor);
      }
      data.hook = {
        init: function init(vnode) {
          // 组件创建真实节点时调用
          // 保存组件的实例到虚拟节点上
          var instance = vnode.componentInstance = new vnode.componentsOptions.Ctor();
          instance.$mount(); // instance.$el
        }
      };
      // console.log(Ctor);
      // 创建vnode
      return vnode(vm, tag, key, data, children, null, {
        Ctor: Ctor
      });
    }
    // _v()
    function createTextVnode(vm, text) {
      // console.log(text)
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    }
    // ast是语法转换,描述语法(html js css), <div xxx> -> div,xxx=true
    // 虚拟dom是描述dom元素,可以增加自定义属性 div.xxx
    function vnode(vm, tag, key, data, children, text, componentsOptions) {
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        children: children,
        text: text,
        componentsOptions: componentsOptions // 组件的构造函数
        // ......
      };
    }
    // 判断是不是同一个虚拟节点
    function isSameVnode(vnode1, vnode2) {
      return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
    }

    function createComponent(vnode) {
      var data = vnode.data;
      // data变为init方法
      data = data.hook;
      if (data) data = data.init;
      if (data) {
        data(vnode); // 初始化组件
      }

      if (vnode.componentInstance) {
        return true;
      }
      return false;
    }
    function createElm(vnode) {
      // console.log(vnode);
      if (!vnode) return;
      var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;
      if (typeof tag === "string") {
        // 标签
        // 区分是组件还是元素
        if (createComponent(vnode)) {
          // 组件
          return vnode.componentInstance.$el;
        }
        // 创建真实节点
        // 将真实节点挂载到虚拟节点,后续修改就可以通过虚拟节点直接找到真实节点
        vnode.el = document.createElement(tag);
        patchProps(vnode.el, {}, data); // 更新属性 xxx=xxx
        children.forEach(function (child) {
          // debugger
          // console.log(child)
          if (!child) return;
          vnode.el.appendChild(createElm(child)); // 会将组件创建的元素插入到父元素
        });
      } else {
        // console.log(vnode) 文本虚拟节点的tag是undefined
        vnode.el = document.createTextNode(text);
      }
      // debugger
      // console.log(vnode.el)
      return vnode.el;
    }
    function patchProps(el) {
      var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      // 老的属性中有,新的没有,要删除老的
      // style
      var oldStyles = oldProps.style || {};
      var newStyles = props.style || {};
      for (var key in oldStyles) {
        if (!newStyles[key]) {
          el.style[key] = '';
        }
      }
      // attributes
      for (var _key in oldProps) {
        if (!props[_key]) {
          el.removeAttribute(_key);
        }
      }
      // 新的覆盖老的
      for (var _key2 in props) {
        if (_key2 === 'style') {
          // 如果是style样式属性
          for (var sytleName in props.style) {
            el.style[sytleName] = props.style[sytleName];
          }
        } else {
          el.setAttribute(_key2, props[_key2]);
        }
      }
    }
    function patch(oldVNode, vnode) {
      if (!oldVNode) {
        // 组件挂载,没有传el
        return createElm(vnode); // vm.$el 组件渲染的结果
      }
      // 初始化时是传一个真实dom,一个虚拟dom
      var isRealElement = oldVNode.nodeType;
      // 初次渲染
      if (isRealElement) {
        var elm = oldVNode; // 拿到真实元素
        var parentElm = elm.parentNode; // 拿到父元素
        var newElm = createElm(vnode);
        // console.log(newElm)
        parentElm.insertBefore(newElm, elm.nextSibling); // 先插入到当前节点的后面(成为兄弟节点)
        parentElm.removeChild(elm); // 删除老节点 
        return newElm;
      } else {
        // 更新时是传两个虚拟dom
        // diff算法
        // console.log(oldVNode, vnode);
        // 1,两个节点不是同一个(key或标签tag不同),则直接更新
        // 2,如果两个节点是同一个,则比较其属性是否有差异(复用老的,更新属性)
        // 3,节点比较完毕,就比较儿子
        // console.log(isSameVnode(oldVNode, vnode));
        // 比较的方法
        return patchVnode(oldVNode, vnode);
      }
    }
    function patchVnode(oldVNode, vnode) {
      // console.log(!isSameVnode(oldVNode, vnode));
      if (!isSameVnode(oldVNode, vnode)) {
        // 用老节点的父节点进行替换
        var _el = createElm(vnode);
        oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
        return _el;
      }
      var el = vnode.el = oldVNode.el; // 复用老节点的元素    
      // 文本的情况,则比较文本内容
      if (!oldVNode.tag) {
        if (oldVNode.text !== vnode.text) {
          el.textContent = vnode.text; // 新的文本,覆盖老文本
        }
      } // 文本的tag是undefined
      // 如果是标签,需要对比标签的属性
      // console.log(1);
      patchProps(el, oldVNode.data, vnode.data);
      // 比较儿子节点 (1,双方都有children;2,只有一方有children)
      var oldChildren = oldVNode.children || {};
      var newChildren = vnode.children || {};
      // console.log(oldChildren, newChildren);
      if (oldChildren.length > 0 && newChildren.length > 0) {
        // console.log(el);
        // 完整diff,需要比较两个人的children
        updateChildren(el, oldChildren, newChildren); // 更新两个人的children
      } else if (newChildren.length > 0) {
        // 没有老的,有新的
        // 直接插入
        mountChildren(el, newChildren);
      } else if (oldChildren.length > 0) {
        // 没有新的,老的有,要删除
        // unmountChildren(el, oldChildren)
        el.innerHTML = ''; // 可以循环删除,这里只是图省事
      }

      return el;
    }
    function mountChildren(el, newChildren) {
      for (var i = 0; i < newChildren.length; i++) {
        var child = newChildren[i];
        el.appendChild(createElm(child));
      }
    }
    function updateChildren(el, oldChildren, newChildren) {
      // console.log(el, newChildren, oldChildren);
      // 比较时,为了提高性能,需要优化(push,shift,pop,unshift,reserve,sort)
      // vue2使用双指针的方式比较两个节点,(优化特殊情况: )只要头指针超过尾指针或者重合,就执行更新
      var oldStartIndex = 0;
      var newStartIndex = 0;
      var oldEndIndex = oldChildren.length - 1;
      var newEndIndex = newChildren.length - 1;
      // console.log(oldEndIndex, newEndIndex);
      var oldStartVnode = oldChildren[0];
      var newStartVnode = newChildren[0];
      var oldEndVnode = oldChildren[oldEndIndex];
      var newEndVnode = newChildren[newEndIndex];
      // 为了防止空格干扰,就在parse里去掉空格
      // console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);
      // 特殊情况: 只要最后/或最前的几个节点不同
      var lastEqIndex = 0; // 解决bug(insertBefore)
      var lastEqVnode = null;
      // 根据老的列表做映射关系,用新的去找,找到就移动,找不到就添加,最后多余的删除
      function makeIndexByKey(children) {
        var map = {};
        children.forEach(function (child, index) {
          map[child.key] = index;
        });
        return map;
      }
      var map = makeIndexByKey(oldChildren);
      console.log(map);
      while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 排除为undefined的情况
        if (!oldStartVnode) {
          oldStartVnode = oldChildren[++oldStartIndex];
        } else if (!oldEndVnode) {
          oldEndVnode = oldChildren[--oldEndIndex];
        }
        // 有一方 头指针 > 尾部指针,则停止循环
        // 从头向后比较
        else if (isSameVnode(oldStartVnode, newStartVnode)) {
          // 递归比较
          patchVnode(oldStartVnode, newStartVnode);
          oldStartVnode = oldChildren[++oldStartIndex]; // 向后移动
          newStartVnode = newChildren[++newStartIndex];
          // 比较开头节点
          // console.log(oldStartIndex, oldEndIndex, newStartIndex, newEndIndex);
        }
        // 从尾向前比较
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
          // 最后一次相同后--,则存入的是不相同的元素
          lastEqVnode = oldChildren[lastEqIndex];
          // console.log(lastEqIndex, lastEqVnode);
          oldEndVnode = oldChildren[--oldEndIndex]; // 向前移动
          newEndVnode = newChildren[--newEndIndex];
          lastEqIndex = oldEndIndex;
        }
        // 交叉比较
        else if (isSameVnode(oldEndVnode, newStartVnode)) {
          // 老的尾 移到 老的头 (insertBefore有移动性,会把旧的移动走)
          el.insertBefore(oldEndVnode.el, oldStartVnode.el);
          // 老的被复用,所以要替换老的
          patchVnode(oldEndVnode, newStartVnode);
          oldEndVnode = oldChildren[--oldEndIndex];
          newStartVnode = newChildren[++newStartIndex];
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
          // 老的头 移到 老的新尾 (insertBefore有移动性,会把旧的移动走)
          el.insertBefore(oldStartVnode.el, newEndVnode.el.nextSibling);
          // 老的被复用,所以要替换老的
          patchVnode(oldStartVnode, newEndVnode);
          oldStartVnode = oldChildren[++oldStartIndex];
          newEndVnode = newChildren[--newEndIndex];
        } else {
          // 乱序比对
          // 如果没有key就直接替换(没办法比较)
          var moveIndex = map[newStartVnode.key]; // 如果拿到,则说明是要移动的索引
          if (moveIndex !== undefined) {
            var moveVnode = oldChildren[moveIndex]; // 找的对应的虚拟节点,复用
            el.insertBefore(moveVnode.el, oldStartVnode.el);
            oldChildren[moveIndex] = undefined; // 表示这个节点已经移动走了(如果是删除会报错)
            patchVnode(moveVnode, newStartVnode); // 比较属性和子节点
          } else {
            // 找不到就创建新的,直接插入到oldStartVnode前 
            el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
          }
          newStartVnode = newChildren[++newStartIndex];
        }
      }
      // console.log(newStartIndex, newEndIndex);
      // 经过上面的比较后,指针都移到了双方最后一个相同的节点的位置,剩下的就是old或new独有的
      // 新的多余的插入
      if (newStartIndex <= newEndIndex) {
        for (var i = newStartIndex; i <= newEndIndex; i++) {
          var childEl = createElm(newChildren[i]);
          // 可能是向前或向后追加
          // 根据后一位有无节点来判断是不是向后追加
          // Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
          // let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null // 获取下一个元素
          var anchor = newChildren[newEndIndex + 1] ? lastEqVnode.el : null; // 获取下一个元素
          // el.appendChild(childEl) // 添加节点
          // console.log(childEl, anchor);
          el.insertBefore(childEl, anchor); // anchor为null,则认为是appendChild
        }
      }
      // 旧的多余的删除
      if (oldStartIndex <= oldEndIndex) {
        for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
          // 排除是undefined的情况,有值才删除
          if (oldChildren[_i]) {
            var _childEl = oldChildren[_i].el;
            el.removeChild(_childEl);
          }
        }
      }
    }

    function initLifeCycle(Vue) {
      // 虚拟dom转真实dom
      Vue.prototype._update = function (vnode) {
        var vm = this;
        var el = vm.$el;
        // console.log('update', vnode)
        // 判断是否是更新操作
        var prevVnode = vm._vnode;
        // 把组件第一次产生的虚拟节点保存到vnode上
        vm._vnode = vnode;
        if (prevVnode) {
          // 之前渲染过了
          // diff更新
          patch(prevVnode, vnode);
        } else {
          // 初始化 
          vm.$el = patch(el, vnode);
        }
      };
      // _c{'div',{},...children}
      Vue.prototype._c = function () {
        // this -> vm
        return createElementVnode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };
      // _v(text)
      Vue.prototype._v = function () {
        // console.log(...arguments)
        // console.log(...arguments)
        // console.log(createTextVnode(this, ...arguments))
        return createTextVnode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };
      Vue.prototype._s = function (value) {
        // console.log(value)
        // 插值表达式里的值(zs)如果不是对象,就直接返回 
        if (_typeof(value) !== 'object') return value;
        // 如果是对象,就转字符串    
        return JSON.stringify(value);
      };
      // 渲染虚拟dom
      Vue.prototype._render = function () {
        // console.log('render')
        // const vm = this 
        // 让with里的this指向vm
        // 此时可以视图和属性进行绑定
        return this.$options.render.call(this); // ast语法转义后生成的render
      };
    }
    // 组件挂载
    function mountComponent(vm, el) {
      // 把要被挂载的真实dom,放到vm实例上
      vm.$el = el; // 这个el是querySelector获取了的
      // 1,调用render方法产生虚拟节点,虚拟dom
      // 2,根据虚拟dom生成真实dom 
      // 3,插入el元素
      // 创建watcher
      var updateComponent = function updateComponent() {
        vm._update(vm._render());
      };
      // debugger
      new Watcher(vm, updateComponent, true); // true用于标识这是一个渲染watcher
      // console.log(watcher)
      // 改为在Watcher创建时调用,进行初次渲染
      // vm._update(vm._render()) // vm.$options.render 返回虚拟节点
    }
    // vue核心流程: 1,创建响应式数据 2,模板转化为ast语法树
    // 3,将ast转换为render函数 4,后续每次更新可以只执行render函数(无需再次执行ast转换)
    // render函数会产生虚拟节点(使用响应式数据)
    // 根据生成的虚拟dom创造真实dom

    // 提供给vue来使用(此时全局还没有vue对象,所以没办法直接挂载)
    function initMixin(Vue) {
      // 初始化操作
      Vue.prototype._init = function (options) {
        // debugger
        // 将用户传入的options挂载到vue对象上
        var vm = this; // 原型中的this表示实例
        // vm.$options = options // $xxx 表示是vue的属性(在(vue里,如果data里的变量名是$开头,vue是拿不到的)
        vm.$options = mergeOptions(this.constructor.options, options); // $xxx 表示是vue的属性(在(vue里,如果data里的变量名是$开头,vue是拿不到的)
        // 初始化状态
        // console.log(vm.$options)
        initState(vm);
        // callHook(vm, 'created')     
        if (options.el) {
          vm.$mount(options.el);
        }
      };
      // 渲染模板的操作
      Vue.prototype.$mount = function (el) {
        // console.log(el)
        var vm = this;
        // 获取el对应的dom
        el = document.querySelector(el);
        // console.log(el);
        var ops = vm.$options;
        if (!ops.render) {
          // 先看有没有render函数
          var template; // 没有render就看看有没有template
          // 如果用户没有使用了render函数
          if (!ops.template && el) {
            // 没有写模板,但是写了el
            /*
                1）innerHTML:
                从对象的起始位置到终止位置的全部内容,不包括Html标签。
                2）outerHTML:
                除了包含innerHTML的全部内容外, 还包含对象标签本身。
            */
            template = el.outerHTML; // outerHTML在火狐下可能不兼容
          } else {
            // if (el) {
            // console.log(el) 
            // 写了template,就用用户的template
            template = ops.template;
            // }
          }
          // console.log(template)
          if (template) {
            // 对模板进行编译
            var render = compileToFunction(template);
            ops.render = render;
          }
        }
        // console.log(ops.render)// 最终获取render方法
        // 组件挂载
        mountComponent(vm, el);
        // script标签引用的vue.global.js,这个过程是在浏览器运行的
        // runtime是不包含模板编译的,整个编译是打包时通过loader来转义vue文件的,用runtime时不能使用template
      };
    }

    // class会把所有方法耦合在一起
    function Vue(options) {
      // options就是用户提供的选项 
      this._init(options); // 初始化 
      // if (options.el) this.$mount(options.el) // 挂载
    }
    // debugger
    initMixin(Vue);
    initLifeCycle(Vue); // 组件渲染
    initGlobalAPI(Vue);
    initStateMixin(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
