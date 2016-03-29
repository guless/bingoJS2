
    var _toObserve = function (p) {
           
    };


Object.defineProperties(Object, {
    "bgToObserve": {
        //__proto__: null, // 没有继承的属性
        //是否可以删除， 默认为false
        configurable: false,
        //是否可以遍历， 默认为false
        enumerable: false,
        //值, 默认为 undefined
        value: function (p) {
            console.log(p);
        },
        //是否可以写, 不能与get,set共存, 默认为 false
        //如果为false, 可以赋值， 但不会成功
        writable: true
    },
    "bgObserve": {
        //__proto__: null, // 没有继承的属性
        //是否可以删除， 默认为false
        configurable: false,
        //是否可以遍历， 默认为false
        enumerable: false,
        //值, 默认为 undefined
        value: function (p) {
            console.log(p);
        },
        //是否可以写, 不能与get,set共存, 默认为 false
        //如果为false, 可以赋值， 但不会成功
        writable: true
    }
});

Object.defineProperties(Object.prototype, {
    "__toObserver": {
        //__proto__: null, // 没有继承的属性
        //是否可以删除， 默认为false
        configurable: false,
        //是否可以遍历， 默认为false
        enumerable: false,
        //值, 默认为 undefined
        value: {},
        //是否可以写, 不能与get,set共存, 默认为 false
        //如果为false, 可以赋值， 但不会成功
        writable: true
    },
    "__bg_propery_": {
        //__proto__: null, // 没有继承的属性
        //是否可以删除， 默认为false
        configurable: false,
        //是否可以遍历， 默认为false
        enumerable: false,
        //值, 默认为 undefined
        value: {},
        //是否可以写, 不能与get,set共存, 默认为 false
        //如果为false, 可以赋值， 但不会成功
        writable: false
    },
    "property1": {
        //__proto__: null, // 没有继承的属性
        //是否可以删除， 默认为false
        configurable: false,
        //是否可以遍历， 默认为false
        enumerable: false,
        //值, 默认为 undefined
        value: true,
        //是否可以写, 不能与get,set共存, 默认为 false
        //如果为false, 可以赋值， 但不会成功
        writable: true
    }
});


//var obj1 = {};
//Object.defineProperties(obj1, {
//    "property1": {
//        //__proto__: null, // 没有继承的属性
//        //是否可以删除， 默认为false
//        configurable: false,
//        //是否可以遍历， 默认为false
//        enumerable: false,
//        //值, 默认为 undefined
//        value: true,
//        //是否可以写, 不能与get,set共存, 默认为 false
//        //如果为false, 可以赋值， 但不会成功
//        writable: true
//    },
//    "property2": {
//        //是否可以删除， 默认为false
//        configurable: false,
//        //是否可以遍历， 默认为false
//        enumerable: true,
//        //是否可以写, 默认为 false
//        //writable: true,
//        get: function () {
//            console.log('get!', this.__bg_propery_.property2, this);
//            return this.__bg_propery_.property2;
//        },
//        set: function (value) {
//            this.__bg_propery_.property2 = value;
//            console.log('set!', this.__bg_propery_.property2);
//        }
//    },
//    "__bg_propery_": {
//        //__proto__: null, // 没有继承的属性
//        //是否可以删除， 默认为false
//        configurable: false,
//        //是否可以遍历， 默认为false
//        enumerable: false,
//        //值, 默认为 undefined
//        value: {},
//        //是否可以写, 不能与get,set共存, 默认为 false
//        //如果为false, 可以赋值， 但不会成功
//        writable: false
//    }
//});
//注意：某些浏览器有问题
// 1.不要依赖重新定义数组的length属性。
// IE8 只能在Dom对象使用defineProperties / definePropertie
