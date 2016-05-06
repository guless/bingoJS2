
(function (bingo) {
    "use strict";
    var _Promise = bingo.Promise,
        doc = document,
        head = doc.head ||
          doc.getElementsByTagName('head')[0] ||
          doc.documentElement,
       baseElement = head.getElementsByTagName('base')[0],
       READY_STATE_RE = /loaded|complete|undefined/i;

    var _fetch = function (url, callback, charset) {

        //每一个async属性的脚本都在它下载结束之后立刻执行，同时会在window的load事件之前执行。
        //所以就有可能出现脚本执行顺序被打乱的情况；
        //每一个defer属性的脚本都是在页面解析完毕之后，按照原本的顺序执行，同时会在document的DOMContentLoaded之前执行。

        //但defer并不是所有浏览器都遵从
        var node = doc.createElement('script');
        node.type = 'text/javascript';
        node.charset = charset || 'utf-8';
        node.async = true;//'async';
        node.defer = false; //'defer';
        node.src = url;

        scriptOnload(node, callback || bingo.noop);


        // ref: #185 & http://dev.jquery.com/ticket/2709 
        // 关于base 标签 http://www.w3schools.com/tags/tag_base.asp
        baseElement ?
            head.insertBefore(node, baseElement) :
            head.appendChild(node);

    },
    scriptOnload = function (node, callback) {

        var loadedFun = function () {
            if (!node) return;
            //正则匹配node的状态
            if (READY_STATE_RE.test(node.readyState)) {

                node.onload = node.onerror = node.onreadystatechange = null;

                if (!bingo.isDebug && node.parentNode) {
                    node.parentNode.removeChild(node);
                }

                try {
                    callback && callback(node.src);
                } finally {
                    node = undefined;
                    callback = null;
                }
            }
        };

        node.onload = node.onerror = node.onreadystatechange = function () {
            loadedFun();
        };

    };

    var _loaded = [], _loading = [], _loadAll = [],
        _addAll = function (fn, lv) {
            _loadAll.push({ fn: fn, lv: lv });
            _loadAll.sort(function (item1, item2) { return item1.lv - item2.lv; });
            (!_isLoading()) && _checkEnd();
        },
        _exist = function (file) {
            if (bingo.isNullEmpty(file)) return true;
            return _loading.some(function (item) { return item.file == file; })
                || _isLoaded(file);
        },
        _isLoaded = function (file) {
            return _loaded.some(function (item) { return item == file; });
        },
        _isLoading = function () {
            return _loading.length > 0;
        },
        _getLoading = function (file) {
            var index = bingo.inArray(function (item) { return this.file == file; }, _loading);
            return index >= 0 ? _loading[index] : null;
        },
        _tid,
        _loadFile = function (file, fn) {
            if (_isLoaded(file)) {
                fn && fn(file);
            } else {
                var lf = _getLoading(file);
                if (lf) {
                    lf.fns.push(fn);
                } else {
                    _loading.push({ file: file, fns: [fn], status: 0 });
                    _tid || (_tid = setTimeout(_done, 0));
                }
            }
        },
        _done = function () {
            _tid = null;
            bingo.each(_loading, function (item) {
                if (item.status > 0) return;
                var file = item.file;
                item.status = 1;//加载中
                _fetch(file, function () {
                    _toLoad(_loading, item);
                });
            });
        },
        _toLoad = function (list, item) {
            var index = list.indexOf(item);
            //从loading删除
            index < 0 || list.splice(index, 1);
            //添加到loaded
            _loaded.push(item.file);
            bingo.each(item.fns, function (fn) {
                fn && fn(item.file);
            });
            _checkEnd();
        },
        _checkEnd = function () {
            var idEnd = !_isLoading();
            if (idEnd) {
                //debugger;
                //console.log('end');
                _loading = [];
                var all = _loadAll;
                _loadAll = [];
                bingo.each(all, function (item) {
                    item.fn();
                });
            } else
                _done();
        };

    var _usingDone = false;
    bingo.extend({
        using: function (url) {
            /// <summary>
            /// bingo.using('/js/file1.js').then <br />
            /// </summary>
            /// <param name="p">url</param>
            if (_usingDone) {
                _usingDone = false;
                return bingo.config().using(url);
            } else {
                try {
                    _usingDone = true;
                    return bingo.route(url).usingPromise();
                } finally {
                    _usingDone = false;
                }
            }
        },
        usingAll: function (lv) {
            bingo.isNumeric(lv) || (lv = bingo.using.Normal);
            return bingo.Promise(function (r) {
                _addAll(r, lv);
            });
        }
    });

    bingo.extend(bingo.using, {
        First: 0,
        NormalBefore: 45,
        Normal: 50,
        NormalAfter: 55,
        Last: 100
    });
    //end using===================================

    var _noop = bingo.noop, _htmlType = 'text/html',
        _textType = 'text/plain', _jsonType = 'application/json',
        _mimeToDataType = function (mime) {
        return mime && (mime == _htmlType ? 'html' :
          mime == _jsonType ? 'json' :
          /^(?:text|application)\/javascript/i.test(mime) ? 'script' :
          /^(?:text|application)\/xml/i.test(mime) && 'xml') || 'text';
    }, _appendQuery = function (url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }, _serializeData = function (options) {
        if (!options.data) return;
        var p = [];
        if (bingo.isObject(options.data)){
            bingo.eachProp(options.data, function (item, name) {
                p.push(encodeURIComponent(name) + '=' + encodeURIComponent(bingo.isObject(item) || bingo.isArray(item) ? JSON.stringify(item): item));
            });
            options.data = p.join('&').replace('%20', '+');
        }
        if (!options.type || options.type.toUpperCase() == 'GET')
            options.url = _appendQuery(options.url, options.data);
    }, _ajaxOpt = {
        type: 'GET',
        beforeSend: _noop,
        success: _noop,
        error: _noop,
        complete: _noop,
        context: null,
        xhr: function () {
            return new window.XMLHttpRequest();
        },
        accepts: {
            script: 'text/javascript, application/javascript',
            json: _jsonType,
            xml: 'application/xml, text/xml',
            html: _htmlType,
            text: _textType
        },
        crossDomain: false,
        timeout: 0
    }, _ajax = function (options) {
        var settings = bingo.extend({}, options);
        for (var key in _ajaxOpt) if (settings[key] === undefined) settings[key] = _ajaxOpt[key];

        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
          RegExp.$2 != window.location.host;

        var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url);
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder) settings.url = _appendQuery(settings.url, 'callback=?');
            return _ajaxJSONP(settings);
        }

        if (!settings.url) settings.url = window.location.toString();
        _serializeData(settings);

        var mime = settings.accepts[dataType],
            baseHeaders = {},
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = _ajaxOpt.xhr(), abortTimeout;

        if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
        if (mime) {
            mime += ', */*; q=0.01';
            baseHeaders['Accept'] = mime;
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }
        if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
            baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded; charset=UTF-8');
        settings.headers = bingo.extend(baseHeaders, settings.headers);

        var context = settings.context;

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                clearTimeout(abortTimeout);
                var result, error = false, cpType = '';;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || _mimeToDataType(xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;

                    try {
                        if (dataType == 'script') (1, eval)(result);
                        else if (dataType == 'xml') result = xhr.responseXML;
                        else if (dataType == 'json') result = /^\s*$/.test(result) ? null : JSON.parse(result);
                    } catch (e) { error = e; }

                    if (error) {
                        cpType = 'parsererror';
                        settings.error.call(context, xhr, cpType, error);
                    } else {
                        cpType = 'success';
                        settings.success.call(context, result, cpType, xhr);
                    }
                } else {
                    cpType = 'error';
                    settings.error.call(context, xhr, cpType, xhr);
                }
                settings.complete.call(context, xhr, cpType)
            }
        };

        var async = 'async' in settings ? settings.async : true;
        xhr.open(settings.type, settings.url, async);

        for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name]);

        if (settings.beforeSend.call(context, xhr, settings) === false) {
            xhr.abort();
            return false;
        }

        if (settings.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.onreadystatechange = _noop;
            xhr.abort();
            settings.complete.call(context, xhr, 'timeout')
        }, settings.timeout);

        xhr.send(settings.data ? settings.data : null);
        return xhr;
    }, _ajaxJSONP = function (options) {
        var callbackName = 'jsonp' + bingo.makeAutoId(),
          script = document.createElement('script'),
          abort = function () {
              head.removeChild(script);
              if (callbackName in window) window[callbackName] = _noop
              options.complete.call(options.context, xhr, 'abort')
          },
          xhr = { abort: abort }, abortTimeout;

        if (options.error) script.onerror = function () {
            xhr.abort();
            options.error();
        };

        window[callbackName] = function (data) {
            clearTimeout(abortTimeout);
            head.removeChild(script);
            delete window[callbackName];
            settings.success.call(options.context, data, 'success', xhr);
        };

        _serializeData(options);
        script.src = options.url.replace(/=\?/, '=' + callbackName);
        head.appendChild(script);

        if (options.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.abort();
        }, options.timeout);

        return xhr;
    };

    var _ajaxDoing = false;
    bingo.ajax = function (url, p) {
        if (_ajaxDoing) {
            _ajaxDoing = false;
            return bingo.config().ajax(url, p);
        } else {
            try {
                _ajaxDoing = true;
                return bingo.route(url).ajaxPromise(p);
            } finally {
                _ajaxDoing = false;
            }
        }
    };

    var _tagTestReg = /^\s*<(\w+|!)[^>]*>/, _tmpling = false;
    bingo.tmpl = function (p, aP) {
        /// <summary>
        /// bingo.tmpl('tmpl/aaaa/user').then(...;<br />
        /// bingo.tmpl('#userTmplId').then(...;<br />
        /// bingo.tmpl(node).then(...;<br />
        /// </summary>
        var html = '', node = p;
        if (bingo.isString(p)) {
            if (p.indexOf('#') < 0) {
                if (!p || _tagTestReg.test(p)) {
                    return _Promise.resolve(p);
                } else {
                    if (_tmpling) {
                        _tmpling = false;
                        return bingo.config().tmpl(p, aP);
                    } else {
                        try {
                            _tmpling = true;
                            return bingo.route(p).tmplPromise(aP);
                        } finally {
                            _tmpling = false;
                        }
                    }
                }
            } else
                node = document.getElementById(p.substr(1));
        }
        if (node) {
            var cLen = node.children.length, first = node.firstElementChild;
            if (cLen == 1 && first.tagName.toLowerCase() == 'script')
                html = first.innerHTML;
            else
                html = node.innerHTML;
        }
        return _Promise.resolve(html);
    };

    var _cacheName = '_bg_cache2_';
    bingo.cache = function (owner, key, p, max) {
        var cache = owner[_cacheName];
        if (arguments.length == 2) {
            if (!cache) return undefined;
            var index = bingo.inArray(function (item) { return item[0] == key; }, cache);
            return index > -1 ? cache[index][1] : undefined;
        } else {
            arguments < 4 && (max = 20);
            cache || (cache = owner[_cacheName] = []);
            var index = bingo.inArray(function (item) { return item[0] == key; }, cache);
            var c = index > -1 ? cache[index] : null, t = new Date().valueOf();
            if (c) {
                c[1] = p, c[2] = t;
            } else {
                c = [key, p, t];
                cache.push(c);
                if (cache.length >= max + 5) {
                    cache.sort(function (item, item1) { return item1[2] - item[2]; });
                    owner[_cacheName] = bingo.sliceArray(cache, 0, cache.length - 5);
                }
            }
            return p;
        }
    };
    bingo.cacheRemove = function (owner, key) {
        var cache = owner[_cacheName];
        if (cache) {
            var index = bingo.inArray(function () { return this[0] == key; }, cache);
            return (index > -1) ? cache.splice(index, 1)[0] : undefined;
        }
    };


    //route=====================================================

    /*
        //1. 添加或设置路由'view'
        bingo.route('view', {
            //优先级, 越小越前, 默认100
            priority: 100,
            //路由地址
            url: 'view/{controller*}',
            //路由转发到地址（可以function(url, params)）
            to: 'modules/{controller*}.html',
            //第二种配置
            to: {
                //（可以function(url, params)）
                ajax:'modules/{controller*}.html',
                tmpl:'modules/{controller*}.html',
                using:''modules/{controller*}.html'
            },
            //默认
            promise:{
                ajax:function(p){
                    return bingo.config().tmpl(this.tmpl, p);
                },
                tmpl:function(p){
                    return bingo.config().ajax(this.ajax, p);
                },
                usin:function(p){
                    return _usingIn(this.using);
                }
            }
            //默认值
            defaultValue: { app: '', controller: 'user/list' }
        });

        //2. 根据url生成目标url;
            var url = bingo.route('view/user/list');
                返回结果==>{tmpl:'modules/user/list.html'}
    */
    //路由
    bingo.route = function (p, context) {
        if (arguments.length == 1)
            return bingo.routeContext(p).to;
        else
            p && context && _routes.add(p, context);
    };

    /*
        //根据url生成routeContext;
        var routeContext = bingo.routeContext('view/user/list');
            返回结果==>{
                url:'view/user/list',
                toUrl:'modules/user/list.html',
                params:{ app: '', controller: 'user/list' }
            }
    */
    //
    bingo.routeContext = function (url) {
        return _routes.getRouteByUrl(url);
    };

    /*
        //生成路由地址
        bingo.routeLink('view', { app: '', controller: 'user/list' });
            返回结果==>'view/user/list'
    */
    bingo.routeLink = function (name, p) {
        var r = _routes.getRuote(name);
        return r ? _paramToUrl(r.context.url, p, 1) : '';
    };

    /*
        //生成路由地址query
        bingo.routeLinkQuery('view/user/list', { id: '1111' });
            返回结果==>'view/user/list$id:1111'
    */
    bingo.routeLinkQuery = function (url, p) {
        url || (url = '');
        var urlPath = '';
        if (url.indexOf('$') >= 0 || url.indexOf('?') >= 0) {
            var routeContext = bingo.routeContext(url);
            p = bingo.extend({}, p, routeContext.params.queryParams);
            var sp = url.indexOf('$') >= 0 ? '$' : '?';
            url = url.split(sp)[0];
        }
        bingo.eachProp(p, function (item, n) {
            item = encodeURIComponent(item || '');
            //route参数形式, $aaa:1$bbb=2
            urlPath = [urlPath, '$', n, ':', item].join('');
        });
        return [url, urlPath].join('');
    };


    var _makeRegexPath = /(\W)/g,
        //查找query部分, ?aaa=111&b=222
        _urlQueryPart = /\?[^?=]+\=.*$/,
        _isRegexMapPath = function (path) {
            return (!bingo.isNullEmpty(path)
                    && /[?*]+/.test(path.replace(_urlQueryPart, '')));
        }, _makeRegexMapPath = function (path) {
            path = path.replace(_urlQueryPart, '');
            if (!_isRegexMapPath(path)) return null;

            _makeRegexPath.lastIndex = 0;
            var regS = path.replace(_makeRegexPath, "\\$1").replace(/\\\*\\\*/g, '(.*?)').replace(/(\\([?*]))/g, '([^./\]$2?)');
            regS = ['^', regS, '$'].join('');
            return new RegExp(regS);
        };


    var _tranAttrRex = /\{([^}]+)\}/gi,
        _makeRegexPathSS = /\*\*|[?*](?!})/g,//查找 ?和*符号
        _keyAll = /\*$/;
    var _urlToParams = function (url, routeContext) {
        //匹配url, 并生成url参数
        // 如'view/{app}/{contrller}' ==> {app:'', contrller:''}
        if (!url || !routeContext.url) return null;
        var matchUrl = routeContext.url;
        //todo:{name*}

        var pathReg = routeContext._reg;
        if (!pathReg) {
            //去除$后面部分内容, 作为查询条件
            var urlTest = matchUrl.indexOf('$') >= 0 ? matchUrl.split('$')[0] : matchUrl;
            _tranAttrRex.lastIndex = 0;
            urlTest = urlTest.replace(_tranAttrRex, function (find, name) {
                //console.log(name);
                return _keyAll.test(name) ? '**' : '*';
            });
            pathReg = routeContext._reg = (routeContext._reg = _makeRegexMapPath(urlTest));
        }
        //url参数部分由$分开， 如aaaa/ssss.html$aaa:1$bb:2
        var urlParams = url.split('$');
        if (!pathReg.test(urlParams[0])) return null;

        var matchUrlList = [];
        matchUrl.replace(_makeRegexPathSS, '{*}').replace(_tranAttrRex, function (find, key, item2) {
            //console.log(find, item1, item2);
            matchUrlList.push({ key: key, find: find });
        });

        var obj = {}, fKey;

        urlParams[0].replace(pathReg, function () {
            //console.log(arguments);
            var args = arguments;
            bingo.each(matchUrlList, function (item, index) {
                fKey = item.key;
                if (fKey != '*') {
                    obj[fKey.replace('*', '')] = args[index + 1];
                }
                //item.value = args[index + 1];
            });
        })
        //console.log(matchUrlList);

        var queryParams = obj.queryParams = {};

        //如果url匹配， 
        //生成多余参数
        if (urlParams.length > 1) {
            urlParams = bingo.sliceArray(urlParams, 1);
            bingo.each(urlParams, function (item, index) {
                var list = item.split(':'),
                    name = list[0],
                    val = decodeURIComponent(list[1] || '');
                name && (obj[name] = queryParams[name] = val);
            });
        }

        return obj;
    }, _getRouteContext = function () {
        var context = { app: null, controller: null, component: null };
        var params = this.params;
        if (params) {
            var appName = params.app;
            var app = bingo.app(appName);
            context.app = app;
            params.controller && (context.controller = app.controller(params.controller));
            context.controller && (context.controller = context.controller.fn);

            params.component && (context.component = app.component(params.component));
            context.component && (context.component = context.component.fn);
        }
        return context;
    }, _makeRouteContext = function (name, url, to, params) {
        //生成 routeContext
        return { name: name, params: params, url: url, to: to, context: _getRouteContext };
    },
    _passParam = ',component,controller,service,app,queryParams,',
    _paramToUrl = function (url, params, paramType) {
        //_urlToParams反操作, paramType:为0转到普通url参数(?a=1&b=2), 为1转到route参数($a:1$b:2)， 默认为0
        _tranAttrRex.lastIndex = 0;
        if (!url || !params) return url;
        var otherP = '', attr, attr1, val;
        bingo.eachProp(params, function (item, n) {
            attr = ['{', n, '}'].join('');
            attr1 = ['{', n, '*}'].join('');

            if (url.indexOf(attr) >= 0) {
                //如果是url变量参数， 如/{module}/{aciont}/aa.txt
                url = bingo.replaceAll(url, attr, item);
            } else if (url.indexOf(attr1) >= 0) {
                //如果是url变量参数， 如/{module}/{aciont}/aa.txt
                url = bingo.replaceAll(url, attr1, item);
            } else if (_passParam.indexOf(','+n+',') < 0) {
                val = encodeURIComponent(item || '');
                //如果是其它参数
                if (paramType == 1) {
                    //route参数形式, $aaa:1$bbb=2
                    otherP = [otherP, '$', n, ':', val].join('');
                } else {
                    //普通url参数， ?aaa=1&bbb=2
                    otherP = [otherP, '&', n, '=', val].join('');
                }
            }
        });

        if (otherP) {
            //如果有其它参数， 组装到url参数中
            if (paramType == 1) {
                url = [url, otherP].join('');
            } else {
                if (url.indexOf('?') >= 0)
                    url = [url, otherP].join('');
                else
                    url = [url, otherP.substr(1)].join('?');
            }
        }

        return url;
    };

    bingo.app.extend({
        route: function () { }
    });

    var _routes = {
        datas: [],
        defaultRoute: {
            url: '**',
            to: function (url, param) { return url; }
        },
        add: function (name, context) {
            var route = this.getRuote(name);
            if (bingo.isUndefined(context.priority))
                context.priority = 100;
            if (route) {
                route.context = context;
            } else {
                this.datas.push({
                    name: name,
                    context: context
                });
            }
            this.datas.sort(function (item1, item2) { return item1.context.priority - item2.context.priority; });
        },
        getRuote: function (name) {
            var item = null;
            bingo.each(this.datas, function () {
                if (this.name == name) { item = this; return false; }
            });
            return item;
        },
        getRouteByUrl: function (url) {
            if (!url) return '';


            var querys = url.split('?');
            if (querys.length > 1) url = querys[0];
            var routeContext = null, name='';
            var params = null;
            bingo.each(this.datas, function () {
                routeContext = this.context;
                params = _urlToParams(url, routeContext);
                //如果params不为null, 认为是要查找的url
                if (params) { name = this.name; return false; }
            });

            //再找组装参数
            if (!params){
                routeContext = _routes.defaultRoute;
                name = 'defaultRoute';
            }
            if (params || routeContext.defaultValue)
                params = bingo.extend({}, routeContext.defaultValue, params);

            //var toUrl = bingo.isFunction(routeContext.toUrl) ?
            //    routeContext.toUrl.call(routeContext, url, params)
            //    : routeContext.toUrl;

            if (querys.length > 1) {
                params || (params = {});
                querys[1].replace(/([^=&]+)\=([^=&]*)/g, function (find, name, value) {
                    (name in params) || (params[name] = value);
                });
            }

            var to = routeContext.to || '';

            if (!bingo.isObject(to)) {
                to = _routes.makeTo(to, routeContext, url, params);
                to = {
                    using: to,
                    ajax: to,
                    tmpl: to
                };
            } else {
                to = bingo.extend({}, routeContext.to);
                bingo.eachProp(to, function (item, n) {
                    to[n] = _routes.makeTo(item, routeContext, url, params);
                });
            }
            var promise = routeContext.promise || {};
            bingo.extend(to, {
                tmplPromise: promise.tmpl || _tmplPromise,
                ajaxPromise: promise.ajax || _ajaxPromise,
                usingPromise: promise.using || _usingPromise
            });
            //console.log(to);

            //var toUrl = _paramToUrl(toUrl, params);

            return _makeRouteContext(name, url, to, params);
        },
        makeTo: function (to, routeContext, url, params) {
            bingo.isFunction(to) && (to = to.call(routeContext, url, params));
            return _paramToUrl(to, params);
        }
    };

    var _tmplPromise = function (p) {
        return bingo.config().tmpl(this.tmpl, p);
    }, _ajaxPromise = function (p) {
        return bingo.config().ajax(this.ajax, p);
    }, _usingPromise = function (p) {
        return bingo.config().using(this.using);
    };

    //route=====================================================


    //bingo.config=====================================================
    bingo.config({
        using: function (url) {
            return bingo.Promise(function (r) {
                _loadFile(url, function (url) { r(url); });
            });
        },
        ajax: function (url, p) {
            return _Promise(function (resolve, reject) {
                _ajax(bingo.extend({ type: 'post', dataType: 'json' }, p, {
                    url: url,
                    success: function (res) {
                        try {
                            p && p.success && p.success.apply(this, arguments);
                            resolve(res);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    error: function () {
                        try {
                            p && p.error && p.error.apply(this, arguments);
                            reject(arguments[2]);
                        } catch (e) {
                            reject(e);
                        }
                    }
                }));
            });
        },
        tmpl: function (url, p) {
            var key = url;
            var cache = bingo.cache(_tmplCacheObj, key);
            if (bingo.isString(cache)) {
                return _Promise.resolve(cache);
            } else {
                var tFn = function (html) {
                    if (bingo.isString(html))
                        bingo.cache(_tmplCacheObj, key, html, 200);
                    return html;
                };

                return bingo.config().ajax(url, bingo.extend({
                    dataType: 'text', type: 'get'
                }, p)).then(tFn);
            }
        }
    });
    var _tmplCacheObj = {};
    //end bingo.config=====================================================

})(bingo);
