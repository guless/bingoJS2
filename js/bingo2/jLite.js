; (function (window) {

    var document = window.document,
        documentEle = document.documentElement,
		/* 版本 */
		version = "v0.2",

		/* 初始化 jLite */
		jLite = function (selector, context) {
		    return new jLite.fn.init(selector, context);
		},
		emptyArray = [],
		push = Array.prototype.push,
        slice = Array.prototype.slice,
		isWindow = function (obj) { return obj != null && obj == obj.window; },
		isObject = function (a) { return typeof a === "object"; },
		isString = function (a) { return typeof a === "string"; },
		isNumber = function (a) { return typeof a === "number"; },
		isFunction = function (a) { return typeof a === "function"; },
		isEqual = function (a, b) { return a === b; },
		isJson = function (obj) {
		    var isjson = (
						typeof obj == "object" &&
						Object.prototype.toString.call(obj).toLowerCase() == "[object object]" &&
						!obj.length
					);
		    return isjson;
		},
		isScope = true,
		fragmentRE = /^\s*<(\w+|!)[^>]*>/,
		matches = documentEle.matchesSelector ||
			documentEle.mozMatchesSelector ||
			documentEle.webkitMatchesSelector ||
			documentEle.oMatchesSelector ||
			documentEle.msMatchesSelector;

    /* jLite 基础对象 */
    jLite.fn = jLite.prototype = {
        jLite: version,
        constructor: jLite,
        selector: "",

        length: 0,
        push: push,
        sort: [].sort,
        splice: [].splice
    };

    /* 继承方法，用于扩展 */
    jLite.extend = jLite.fn.extend = function () {
        var src, copy, name, options,
	        		target = arguments[0] || {},    // 常见用法 jLite.extend( obj1, obj2 )，此时，target为arguments[0]
	        		i = 1,
	        		length = arguments.length;

        if (isString(arguments[0]) && length > i) {  //jLite.extend("XXX",{});
            target = arguments[1] || {};
            i = 2;
        }

        if (length === i) {   // 处理这种情况 jLite.extend(obj)，或 jLite.fn.extend( obj )
            target = this;  // jLite.extend时，this指的是jLite；jLite.fn.extend时，this指的是jLite.fn
            --i;
        }

        for (; i < length; i++) {
            if ((options = arguments[i]) != null) { // 比如 jLite.extend( obj1, obj2, obj3, ojb4 )，options则为 obj2、obj3...

                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    if (target === copy) {    // 防止自引用，不赘述
                        continue;
                    }

                    if (copy !== undefined) {  // 浅拷贝，且属性值不为undefined
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };

    /* 包装 jLite 对象
	 * elements: jLite.q 返回的数组
	 * selector: 选择器	
	 */
    var JLITE = function (selector, elements) {
        var ret = jLite.merge(this.constructor(), elements);
        ret.context = this.context ? this.context :
				isString(selector) ? document : selector;
        isEqual(ret.context, document) && !isObject(selector) ?
        ret.selector = jLite.fn.trim((this.selector + " " + selector)) : ret.selector = this.selector;
        this.length > 0 ? ret.prevObject = this : null;
        return ret;
    };

    /* 检测 scope */
    try {
        document.body.querySelectorAll(":scope *");
    } catch (e) {
        isScope = false;
    }

    var csss = [
		"width", "height", "fontSize",
		"padding", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
		"margin", "marginLeft", "marginRight", "marginTop", "marginBottom"
    ];

    /* jLite 扩展方法 */
    jLite.extend("jLiteBasic", {
        /* 合并两个数组 */
        merge: function (first, second) {
            var len = +second.length,
			j = 0,
			i = first.length;

            while (j < len) {
                first[i++] = second[j++];
            }
            first.length = i;
            return first;
        },
        /* 简单处理数组重复元素 */
        uniqueArray: function (array) {
            var r = []
            for (var i in array) {
                r.indexOf(array[i]) == -1 ? r.push(array[i]) : null;
            }
            return r;
        },
        /* 查询 */
        q: function (selector, element) {
            //querySelectorAll 选择器全局搜索
            //:scope 选择器不受全局影响q:
            return element.querySelectorAll((isScope ? ":scope " : "") + selector);
        },
        /* 用于调用内部函数 封装 jLite 对象 
		 * context: 上下文 this
		 * elements: 数组
		 * selector: 查询选择器
		 */
        z: function (selector, context, elements) {
            //包装 jLite 对象
            return JLITE.call(context, selector, elements);
        },
        ready: function (callback) {
            if (/complete | loaded | interactive/.test(document.readyState)) {
                callback();
            } else {
                rootjLite.on("DOMContentLoaded", callback);
            }
        },
        //window 公用方法 load resize scroll...
        windowEvent: function (eventName, callback) {
            var oldFunction = window["on" + eventName];
            if (!isFunction(oldFunction)) {
                window["on" + eventName] = callback;
            } else {
                window["on" + eventName] = function () {
                    oldFunction();
                    callback();
                }
            }
        },
        each: function (obj, callback) {
            var list = slice.apply(obj);
            list.length == 0 && (list = [obj]);
            list.some(function (item, i) {
                return callback.call(item, i, item) === false
            });
        },
        eachProp: function (obj, callback) {
            if (!isJson(obj)) return;
            var item;
            for (var n in obj) {
                item = obj[n];
                if (callback.call(item, n, item) === false) break;
            }
        },
        Events: {}	//eventName : [ {element, fn} ] ， 
    });

    jLite.extend("jLiteHTML", {
        /* 返回childNodes数组 
		 * jLite.parseHTML("<div></div>")
		 */
        parseHTML: function (selector) {
            if (isString(selector)) {
                var name = fragmentRE.test(selector) && RegExp.$1,
					table = document.createElement("table"),
					tableRow = document.createElement("tr"),
					containers = {
					    "tr": document.createElement("tbody"),
					    "tbody": table, "thead": table, "tfoot": table,
					    "td": tableRow, "th": tableRow,
					    "*": document.createElement("div")
					};
                if (!(name in containers)) { name = "*"; }
                var container = containers[name];
                container.innerHTML = selector;
                return container.childNodes;
            }
        },
        /* 获取url参数 */
        getUrlParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }
    });

    jLite.extend("jLiteAjax", {
        ajax: function (json, type) {
            if (isJson(json)) {
                var time, defaults = { type: "get", url: null, data: null, success: null, error: null, timeout: 0 };
                defaults = jLite.extend(defaults, json);
                var xhttp = new XMLHttpRequest();
                xhttp.responseType = type || "text";
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        clearTimeout(time);
                        typeof defaults.success === "function" ? defaults.success(xhttp.response) : null;
                    }
                }
                var url = defaults.type === "get" ? defaults.url + "?" + defaults.data + "&" :
						defaults.type === "post" ? defaults.url + "?" : "";

                xhttp.open(defaults.type, url + "t=" + Math.random(), true);
                if (defaults.timeout) {
                    time = setTimeout(function () {
                        defaults.error("服务器出错或请求超时.");
                        xhttp.abort();
                    }, defaults.timeout);
                }
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send(defaults.type === "get" ? null : defaults.data);
            }
        }
    });

    /* jLite 对象扩展方法 */
    jLite.fn.extend("filter", {
        eq: function (index) {
            return index > -1 ? jLite.z(this[index], this, [this[index]]) : this;
        },
        find: function (selector) {
            var query, result = [];
            jLite.each(this, function () {
                query = jLite.q(selector, this);
                jLite.each(query, function () { result.push(this); });
            });
            return jLite.z(selector, this, jLite.uniqueArray(result));
        },
        closest: function (selector) {
            var result = [];
            this.each(function () {
                var cur = this;
                while (cur && cur.ownerDocument && cur.nodeType !== 11) {
                    if (matches.call(cur, selector)) {
                        result.push(cur);
                        break;
                    }
                    cur = cur.parentNode;
                }
            });
            return jLite.z(selector, this, jLite.uniqueArray(result));
        },
        end: function () {
            return this.prevObject;
        },
        siblings: function (selector) {
            var ret = [];
            jLite.each(this, function () {
                var self = this,
					parentChildren = this.parentNode.children;
                jLite.each(parentChildren, function () {
                    if (this !== self && _self.nodeType === 1 && (!selector || matches.call(this, selector))) {
                        ret.push(this);
                    }
                });
            });
            return jLite.z(selector, this, jLite.uniqueArray(ret));
        },
        nextAll: function (selector) {
            var ret = [];
            jLite.each(this, function () {
                var self = this;
                while (self) {
                    var _self = self.nextElementSibling || self.nextSibling;
                    if (_self && _self.nodeType === 1 && (!selector || matches.call(_self, selector))) {
                        ret.push(_self);
                    }
                    self = _self;
                }
            });
            return jLite.z(selector, this, jLite.uniqueArray(ret));
        },
        next: function (selector) {
            return this.nextAll(selector).first();
        },
        prevAll: function (selector) {
            var ret = [];
            jLite.each(this, function () {
                var self = this;
                while (self) {
                    var _self = self.previousElementSibling || self.previousSibling;
                    if (_self && _self.nodeType === 1 && (!selector || matches.call(_self, selector))) {
                        ret.push(_self);
                    }
                    self = _self;
                }
            });
            return jLite.z(selector, this, jLite.uniqueArray(ret));
        },
        prev: function (selector) {
            return this.prevAll(selector).first();
        },
        first: function () {
            return this.eq(0);
        },
        last: function () {
            return this.eq(this.length - 1);
        }
    });

    var fix = function (event) {
        if (!('defaultPrevented' in event)) {
            event.defaultPrevented = false
            var prevent = event.preventDefault
            event.preventDefault = function () {
                this.defaultPrevented = true
                prevent.call(this)
            }
        }
    };
    var specialEvents = {};
    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'
    jLite.Event = function (type, props) {
        var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
        if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
        event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
        return event
    }

    jLite.fn.extend("extension", {
        each: function (callback) {
            jLite.each.call(this, this, callback);
            return this;
        },
        append: function (selector) {
            var target;
            jLite.each(this, function () {
                target = this;
                jLite.each(jLite.parseHTML(selector), function (_, node) {
                    target.appendChild(node.cloneNode(true));
                });
            });
            return this;
        },
        appendTo: function (selector) {
            var ret = [], target,
				query = isString(selector) ? jLite.q(selector, document) :
						selector.nodeType ? [selector] :
						isObject(selector) ? [selector] :
						[document.body];

            jLite.each(this, function () {
                target = this;
                jLite.each(query, function (_, node) {
                    ret.push(node.appendChild(target));
                });
            });
            return jLite.z("", rootjLite, ret);
        },
        size: function () {
            return this.length;
        },
        text: function (selector) {
            var str = "";
            jLite.each(this, function () {
                isString(selector) ? this.textContent = selector : str += this.textContent;

            });
            return selector ? this : str;
        },
        val: function (value) {
            return arguments.length == 0 ? this[0].value :
                this.each(function () { this.value = value; });
        },
        html: function (selector) {
            if (selector) {
                jLite.each(this, function () {
                    this.innerHTML = selector;
                });
            } else {
                return this[0].innerHTML;
            }
            return this;
        },
        attr: function (key, value) {
            if (value) {
                jLite.each(this, function () {
                    this.setAttribute(key, value);
                });
            } else {
                return this[0].getAttribute(key);
            }
            return this;
        },
        removeAttr: function (key) {
            jLite.each(this, function () {
                this.removeAttribute(key);
            });
            return this;
        },
        prop: function (name, value) {
            return (arguments.length == 1) ?
              (this[0] ? this[0][name] : undefined) :
              this.each(function () {
                  this[name] = value;
              });
        },
        remove: function () {
            if (!this.length) { return; }
            jLite.each(this, function () {
                this ? this.parentNode.removeChild(this) : null;
            });
        },
        parent: function () {
            var ret = [];
            jLite.each(this, function () {
                ret.push(this.parentNode);
            });
            return jLite.z(this, this, jLite.uniqueArray(ret));
        },
        parents: function (selector) { //只会查找第一个元素的 selector 父级
            var ret = [], self = this[0];
            if (isString(selector)) {
                while (true) {
                    if (self.parentNode.nodeName === selector.toUpperCase() || jLite(self).hasClass(selector)) {
                        ret.push(self.parentNode);
                        break;
                    }
                    self = self.parentNode;
                }
            }
            return jLite.z(this, this, jLite.uniqueArray(ret));
        },
        trim: function (selector) {
            return selector.replace(/(^\s*)|(\s*$)/g, '');
        },
        bind: function (events, fn) {
            if (isFunction(fn) && this.length > 0) {
                jLite.each(this, function () {
                    var self = this,
						callback = function (ev) { fn.call(self, ev); };
                    document.addEventListener ?
                        this.addEventListener(events, callback, false) : this.attachEvent("no" + events, callback);

                    //记录监听
                    var jLiteEvents = this.jLiteEvents || (this.jLiteEvents = {});
                    (jLiteEvents[events] || (jLiteEvents[events] = [])).push(callback);
                });
            }
            return this;
        },
        unbind: function (event, fn) {
            jLite.each(this, function () {
                var jLiteEvents = this.jLiteEvents,
			        events = jLiteEvents && jLiteEvents[event];
                if (fn) {
                    if (events) {
                        var index = events.indexOf(event);
                        if (index >= 0)
                            events.splice(index, 1);
                    }
                    events = [fn];
                } else
                    this.jLiteEvents = null;
                if (!events || events.length == 0) return;

                for (var j = 0; j < events.length; j++) {
                    document.addEventListener ?
						this.removeEventListener(event, events[j]) :
						this.detachEvent("on" + event, events[j]);
                }
            });
            return this;
        },
        on: function (events, fn) {
            return this.bind.apply(this, arguments);
        },
        off: function (events, fn) {
            return this.unbind.apply(this, arguments);
        },
        trigger: function (event, data) {
            if (isString(event)) event = jLite.Event(event)
            fix(event)
            event.data = data
            return this.each(function () {
                if ('dispatchEvent' in this) this.dispatchEvent(event)
            })
        },
        focus: function () {
            this[0].focus();
            return this;
        },
        blur: function () {
            this[0].blur();
            return this;
        },
        click: function (fn) {
            this.on('click', fn);
        },
        show: function () {
            return this.each(function () {
                var display = this.style.display;
                if (display && display.toLowerCase().indexOf('none') < 0)
                    return;
                var old = this._disp_old;
                this.style.display = old;
            });
        },
        hide: function () {
            return this.each(function () {
                var display = this.style.display;
                if (display && display.toLowerCase().indexOf('none') >= 0)
                    return;
                this._disp_old = display;
                this.style.display = 'none';
            });
        },
        index: function () {
            var self = this[0],
				parent = this.parent();
            index = 0;
            jLite.each(parent[0].children, function (i) {
                if (self === this) {
                    index = i;
                    return false;
                }
            });
            return index;
        }
    });

    jLite.fn.extend("style", {
        hasClass: function (selector) {
            var classname = this[0].className.split(" "), bool = false;
            jLite.each(classname, function (i) {
                if (classname[i] === selector) {
                    return bool = true;
                }
            });
            return bool;
        },
        addClass: function (selector) {
            jLite.each(this, function () {
                this.className =
					jLite.uniqueArray(
						jLite.merge(this.className.split(" "), selector.split(" "))
					).toString().replace(/,/g, " ");
            });
            return this;
        },
        removeClass: function (selector) {
            jLite.each(this, function () {
                this.className = this.className.split(" ").filter(function (item) {
                    return item != selector;
                }).toString().replace(/,/g, " ");
            });
            return this;
        },
        css: function (selector, val) {
            if (arguments.length > 1) {
                var o = {};
                o[selector] = val;
                selector = o;
            }
            if (isJson(selector)) {
                var self = this;
                jLite.eachProp(selector, function (key, value) {
                    jLite.each(self, function () {
                        (this.currentStyle || this.style)[key] = (
							csss.indexOf(key) > -1 ? value + "px" : value
						);
                    });
                });
            } else if (isString(selector)) {
                return (this[0].currentStyle || this[0].style)[selector];
            }
            return this;
        },
        offset: function () {
            return { top: this[0].offsetTop, left: this[0].offsetLeft }
        },
        outerWidth: function (bool) {
            return bool ? (this[0].offsetWidth + parseInt(this[0].style.marginLeft) + parseInt(this[0].style.marginRight)) : this[0].offsetWidth;
        },
        outerHeight: function (bool) {
            return bool ? (this[0].offsetHeight + parseInt(this[0].style.marginTop) + parseInt(this[0].style.marginBottom)) : this[0].offsetHeight;
        }
    });

    var rootjLite,
		/* 初始化 jLite */
		init = jLite.fn.init = function (selector) {
		    if (!selector) { return this; }

		    if (isWindow(selector)) {
		        return jLite.z(selector, this, [selector])
		    } else if (isString(selector)) {
		        if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">") {
		            return jLite.z("", this, jLite.parseHTML(selector));
		        } else {
		            return jLite.z(selector, this, jLite.q(selector, document));
		        }
		    } else if (selector.nodeType) {
		        return jLite.z(selector, this, [selector]);
		    } else if (isFunction(selector)) {
		        return jLite.ready(selector);
		    } else if (isNumber(selector.length)) {
		        return jLite.z("", this, selector);
		    }
		    return this;
		}

    init.prototype = jLite.fn;
    rootjLite = jLite(document);

    window.jLite = jLite;

})(window);
