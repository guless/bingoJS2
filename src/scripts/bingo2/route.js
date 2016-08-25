
(function (bingo) {
    "use strict";
    var _Promise = bingo.Promise,
        doc = document,
        head = doc.head ||
          doc.getElementsByTagName('head')[0] ||
          doc.documentElement,
       baseElement = head.getElementsByTagName('base')[0],
       READY_STATE_RE = /loaded|complete|undefined/i,
        slice = Array.prototype.slice;

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
        _loadJS = function (file) {
            return _Promise(function (fn) {
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
            });
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

    var _routeTypeReg = /^(.+)\:\:(.*)/,
        _makeRouteTypeUrl = function (url) {
            var type, s;
            if (_routeTypeReg.test(url)) {
                type = RegExp.$1;
                s = RegExp.$2;
            } else {
                s = url;
            }
            return { all: url, url: s, type: type || '' };
        }, _mergeRouteUrlType = function (url, type, rep) {
            //合并type与url, tmpl::user/list, rep是否替换原来类型
            if (!type) return url;
            var urlEx = _makeRouteTypeUrl(url);
            rep = rep != false || !urlEx.type;
            return rep ? [type, urlEx.url].join('::') : url;
        }, _loadRouteType = function (app, type, url, bRoute, p) {
            if (bRoute !== false) {
                url = _mergeRouteUrlType(url, type, false);

                var route = app.route(url), config = bingo.config();
                if (route.promise != _rPromise)
                    return route.promise(p);
                else
                    return _loadConfig[type](route.toUrl, p);

            } else
                return _loadConfig[type](url, p);
        };

    bingo.app.extend({
        using: function (url, bRoute) {
            /// <returns value=''></returns>
            /// <summary>
            /// bingo.using('/js/file1.js').then <br />
            /// bingo.using('/js/file1.js', false).then <br />
            /// </summary>
            /// <param name="bRoute">是否经过route, 默认是</param>
            return _loadRouteType(this, 'using', url, bRoute);
        },
        usingAll: function (url, bRoute) {
            url && this.using(url, bRoute);
            return bingo.Promise(function (r) {
                _addAll(r, 5);
            });
        }
    });

    //end using===================================

    var _noop = bingo.noop, _htmlType = 'text/html',
        _textType = 'text/plain', _jsonType = 'application/json',
        _r20 = /%20/g,
        _noContent = /^(?:GET|HEAD)$/i,
        _hasQ = /\?/,
        _mimeToDataType = function (mime) {
        return mime && (mime == _htmlType ? 'html' :
          mime == _jsonType ? 'json' :
          /^(?:text|application)\/javascript/i.test(mime) ? 'script' :
          /^(?:text|application)\/xml/i.test(mime) && 'xml') || 'text';
        }, _appendQuery = function (url, query) {
            return url += (_hasQ.test(url) ? "&" : "?") + query;
        }, _serializeData = function (url, options) {
            options.url = url;
            if (!options.data) return;
            var p = [];
            if (bingo.isObject(options.data)) {
                bingo.eachProp(options.data, function (item, name) {
                    p.push(encodeURIComponent(name) + '=' + encodeURIComponent(bingo.isObject(item) || bingo.isArray(item) ? JSON.stringify(item) : item));
                });
                options.data = p.join('&').replace(_r20, '+');
            }
            if (_noContent.test(options.type)) {
                options.url = _appendQuery(url, options.data);
                delete options.data;
            }

        }, _ajaxOpt = {
            //dataType: 'json',
            type: "GET",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            async: true,
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
        }, _ajax = function (url, options) {
            var settings = bingo.extend({}, _ajaxOpt, options);

            if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(url) &&
              RegExp.$2 != window.location.host;

            var D = bingo.Deferred();
            var dataType = settings.dataType, hasPlaceholder = /=\?/.test(url);
            if (dataType == 'jsonp' || hasPlaceholder) {
                if (!hasPlaceholder) url = _appendQuery(url, 'callback=?');
                return _ajaxJSONP(url, settings, D);
            }

            //if (!url) url = window.location.toString();
            _serializeData(url, settings);
            url = settings.url;

            var mime = settings.accepts[dataType],
                baseHeaders = {},
                protocol = /^([\w-]+:)\/\//.test(url) ? RegExp.$1 : window.location.protocol,
                xhr = _ajaxOpt.xhr(), abortTimeout;

            if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
            if (mime) {
                mime += ', */*; q=0.01';
                baseHeaders['Accept'] = mime;
                xhr.overrideMimeType && xhr.overrideMimeType(mime);
            }
            var hasContent = !_noContent.test(settings.type);
            baseHeaders['Content-Type'] = settings.contentType;
            settings.headers = bingo.extend(baseHeaders, settings.headers);

            var context = settings.context;

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    clearTimeout(abortTimeout);
                    var result, cpType = '';;
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                        dataType = dataType || _mimeToDataType(xhr.getResponseHeader('content-type'));
                        result = xhr.responseText;

                        try {
                            if (dataType == 'script') (1, eval)(result);
                            else if (dataType == 'xml') result = xhr.responseXML;
                            else if (dataType == 'json') result = /^\s*$/.test(result) ? null : JSON.parse(result);
                            cpType = 'success';
                            D.resolve(result);
                            settings.success.call(context, result, cpType, xhr);
                        } catch (e) {
                            cpType = 'parsererror';
                            D.reject(xhr);
                            settings.error.call(context, xhr, cpType, e);
                        }
                    } else {
                        cpType = 'error';
                        D.reject(xhr);
                        settings.error.call(context, xhr, cpType, xhr);
                    }
                    settings.complete.call(context, xhr, cpType)
                }
            };

            xhr.open(settings.type, url, settings.async);

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
            return D.promise;
        }, _ajaxJSONP = function (url, options, D) {
            var callbackName = 'jsonp' + bingo.makeAutoId(),
              script = document.createElement('script'),
              abort = function () {
                  head.removeChild(script);
                  if (callbackName in window) window[callbackName] = _noop
                  options.complete.call(options.context, xhr, 'abort')
              },
              xhr = { abort: abort }, abortTimeout;

            if (options.error) script.onerror = function () {
                D.reject();
                xhr.abort();
                options.error();
            };

            window[callbackName] = function (data) {
                clearTimeout(abortTimeout);
                head.removeChild(script);
                delete window[callbackName];
                D.resolve(data);
                settings.success.call(options.context, data, 'success', xhr);
            };

            _serializeData(url, options);
            script.src = options.url.replace(/=\?/, '=' + callbackName);
            head.appendChild(script);

            if (options.timeout > 0) abortTimeout = setTimeout(function () {
                xhr.abort();
            }, options.timeout);

            return D.promise;
        }, _tmplCacheObj = ({}).bgCache.option(200), _loadConfig = {
            ajax: _ajax,
            using: _loadJS,
            tmpl: function (url, p) {
                var key = url;
                var cache = _tmplCacheObj(key);
                if (bingo.isString(cache)) {
                    return _Promise.resolve(cache);
                } else {
                    var tFn = function (html) {
                        if (bingo.isString(html))
                            _tmplCacheObj(key, html);
                        return html;
                    };

                    return _ajax(url, bingo.extend({
                        dataType: 'text'
                    }, p)).then(tFn);
                }
            }
        };

    var _tagTestReg = /^\s*<(\w+|!)[^>]*>/;

    bingo.app.extend({
        ajax: function (url, p, bRoute) {
            return _loadRouteType(this, 'ajax', url, bRoute, p);
        },
        _tmpl: {},
        saveTmpl: function (id, tmpl) {
            this._tmpl[id] = tmpl;
        },
        tmpl: function (p, aP, bRoute) {
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
                        var tmplid = aP && aP.tmplid;
                        if (tmplid) {
                            var app = this;
                            return _Promise.resolve().then(function () {
                                if (tmplid in app._tmpl)
                                    return app._tmpl[tmplid];
                                else
                                    return bingo.compile({ tmpl: '{{view app="' + app.name + '" /}}{{include src="' + p + '" /}}', node: doc.body }).then(function (cp) {
                                        cp.$remove();
                                        return app.tmpl('#' + tmplid);
                                    });
                            });
                        }
                        return _loadRouteType(this, 'tmpl', p, bRoute, aP);
                    }
                } else {
                    var id = p.substr(1);
                    if (this._tmpl[id])
                        return _Promise.resolve(this._tmpl[id]);
                    else
                        node = document.getElementById(p.substr(1));
                }
            }
            if (node) {
                var cLen = node.children.length, first = node.firstElementChild;
                if (cLen == 1 && first.tagName.toLowerCase() == 'script')
                    html = first.innerHTML;
                else
                    html = node.innerHTML;
            }
            return _Promise.resolve(html);
        }
    });

    //route=====================================================

    /*
        //1. 添加或设置路由'view'
        bingo.route('view', {
            //优先级, 越小越前, 默认100
            priority: 100,
            //路由地址
            url: 'view/{controller*}',
            //路由转发到地址（可以function(url, params)）
            toUrl: 'modules/{controller*}.html',
            //或者
            promise: function(url, p){
                    return bingo.Promise(funcion(resole){ $.ajax(url, p).then(resole);})
            }
            //默认值
            defaultValue: { app: '', controller: 'user/list' }
        });

        //2. 根据url生成目标url;
            var url = bingo.route('view/user/list');
                返回结果==>{tmpl:'modules/user/list.html'}
    */

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
            urlParams = slice.call(urlParams, 1);
            bingo.each(urlParams, function (item, index) {
                var list = item.split(':'),
                    name = list[0],
                    val = decodeURIComponent(list[1] || '');
                name && (obj[name] = queryParams[name] = val);
            });
        }

        return obj;
    }, _getRouteContext = function () {
        var context = { app: null, controller: null };
        var params = this.params;
        if (params) {
            var appName = params.app;
            var app = bingo.app(appName);
            context.app = app;
            params.controller && (context.controller = app.controller(params.controller));
            context.controller && (context.controller = context.controller.fn);

        }
        return context;
    }, _makeRouteContext = function (routeContext, name, url, toUrl, params) {
        //生成 routeContext
        var promise = routeContext.promise,
            pFn = promise ? function (p) { return promise(this.toUrl, p, this); } : _rPromise;

        return { name: name, params: params, url: url, toUrl: toUrl, promise:pFn, context: _getRouteContext };
    },
    _rPromise = function (p) { return _ajax(this.toUrl, p); },
    _passParam = ',controller,service,app,queryParams,command',
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

    var _checkRoute = function (app) {
        return app._route || _newRouter(app);
    };

    bingo.app.extend({
        route: function (p, context) {
            if (arguments.length == 1)
                return this.routeContext(p);
            else if (bingo.isObject(context))
                p && context && _checkRoute(this).add(p, context);
            else
                return this.routeContext(_mergeRouteUrlType(p, context));
        },
        routeContext: function (url) {
            return _checkRoute(this).getRouteByUrl(url);
        },
        routeLink: function (name, p, type) {
            var r = _checkRoute(this).getRuote(name)
            if (!r && this != bingo.defualtApp)
                r = _checkRoute(bingo.defualtApp).getRuote(name);
            return r ? _mergeRouteUrlType(_paramToUrl(r.context.url, p, 1), type) : '';
        },
        routeQuerystring: function (url, p, type) {
            url || (url = '');
            var urlPath = '';
            if (url.indexOf('$') >= 0 || url.indexOf('?') >= 0) {
                var routeContext = this.routeContext(url);
                p = bingo.extend({}, routeContext.params.queryParams, p);
                var sp = url.indexOf('$') >= 0 ? '$' : '?';
                url = url.split(sp)[0];
            }
            bingo.eachProp(p, function (item, n) {
                item = encodeURIComponent(item || '');
                //route参数形式, $aaa:1$bbb=2
                urlPath = [urlPath, '$', n, ':', item].join('');
            });
            return _mergeRouteUrlType([url, urlPath].join(''), type);
        }
    });

    var _newRouter = function (app) {
        var route = {
            bgNoObserve: true,
            datas: [],
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

                var urlType = _makeRouteTypeUrl(url),
                    types = urlType.type;
                url = urlType.url;

                var querys = url.split('?'), urlOld = url;
                if (querys.length > 1) url = querys[0];
                var routeContext = null, name = '',tt;
                var params = null;
                bingo.each(this.datas, function () {
                    routeContext = this.context;
                    tt = routeContext.type;
                    if (!tt || tt == types) {
                        params = _urlToParams(url, routeContext);
                        //如果params不为null, 认为是要查找的url
                        if (params) { name = this.name; return false; }
                    }
                });

                if (!params && app != bingo.defualtApp) {
                    return _checkRoute(bingo.defualtApp).getRouteByUrl(urlOld);
                }

                //再找组装参数
                if (!params) {
                    routeContext = _defaultRoute;
                    name = 'defaultRoute';
                    params = {};
                }
                if (params || routeContext.defaultValue)
                    params = bingo.extend({}, routeContext.defaultValue, params);

                params.app = app.name;

                if (querys.length > 1) {
                    params || (params = {});
                    querys[1].replace(/([^=&]+)\=([^=&]*)/g, function (find, name, value) {
                        (name in params) || (params[name] = decodeURIComponent(value));
                    });
                }

                var toUrl = _makeTo(routeContext.toUrl, routeContext, url, params);

                return _makeRouteContext(routeContext, name, url, toUrl, params);
            }

        };
        app._route = route;
        app.route('**', _defaultRoute);
        return route;
    };

    var _defaultRoute = {
        priority: 9999999,
        url: '**',
        toUrl: function (url, param) { return url; }
    },
    _makeTo = function (toUrl, routeContext, url, params) {
        bingo.isFunction(toUrl) && (toUrl = toUrl.call(routeContext, url, params));
        return _paramToUrl(toUrl || '', params);
    };

    //end route=====================================================



})(bingo);
