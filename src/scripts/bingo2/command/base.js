
(function (bingo) {
    "use strict";

    var defualtApp = bingo.defualtApp;

    defualtApp.command('view', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        var ctrl = cp.$getAttr('controller');
        if (ctrl) {
            ctrl = cp.$app.controller(ctrl);
            ctrl && cp.$view.$controller(ctrl.fn);
        }

        return cp;
    });
    defualtApp.command('splice', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('<div class="splice">{{view /}} {{text title /}}==============================</div>');

        cp.$controller(function ($view) {
            $view.title = cp.$name;
        });

        //cp.$export = { test: '' };

        return cp;
    });

    defualtApp.command('controller', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('');

        cp.$view.$controller(function () {
            cp.$eval();
        });

        return cp;
    });


    var _forItemReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/;


    defualtApp.command('with', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('');

        var contents = cp.$attrs.$contents;

        if (_forItemReg.test(contents)) {
            var itemName = RegExp.$1, dataName = RegExp.$2 || RegExp.$4;
            if (itemName && dataName) {
                cp.$layout(function () {
                    var bindContext = cp.$attrs.$bindContext(dataName, true),
                        data = bindContext();
                    data && cp.$withData(itemName, data);
                    cp.$html(cp.$contents);
                });
            }
        }
        

        return cp;
    });

    defualtApp.command('for', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        var src = cp.$getAttr('src');

        var itemName = 'item', dataName = 'datas';
        cp.$contents = dataName;
        cp.$tmpl('');

        cp.$layoutResult(function (c) {
            return cp.$html(c.value);
        });

        return cp;
    });

    defualtApp.command('if', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('');

        var _contents = cp.$contents,
            _elseList = cp.$elseList, _getContent = function (index, val) {
                if (index == -1 && val)
                    return _contents;
                else {
                    var ret = cp.$attrs.$result();
                    if (ret) return _contents;
                    var s;
                    bingo.each(_elseList, function (item, i) {
                        if (!item.$attrs.$contents || (index == i && val)
                            || item.$attrs.$result()) {
                            s = item.$contents
                            return false;
                        }
                    });
                    return s;
                }
            };

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return cp.$html(_getContent(-1, c.value));
        });

        bingo.each(_elseList, function (item, index) {
            item.$attrs.$contents && cp.$layout(function () {
                return item.$attrs.$result();
            }, function (c) {
                return cp.$html(_getContent(index, c.value));
            }, 0, false);
        });

        return cp;
    });

    defualtApp.command('include', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl(function () {
            return bingo.tmpl(cp.$getAttr('src'));
        });

        return cp;
    });

    defualtApp.command('html', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return cp.$html(c.value);
        });

        return cp;
    });

    defualtApp.command('text', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            return cp.$text(c.value);
        });

        return cp;
    });

    defualtApp.command('select', function (cp) {
        /// <param name="cp" value="_newCP()"></param>
        cp.$tmpl('{{view /}}<select>{{for item in datas}}<option value="1"></option>{{/for}}</select>');

        cp.$controller(function ($view) {

            $view.idName = '';
            $view.textName = '';
            $view.id = '';
            $view.datas = '';
        });

        return cp;
    });




    return;
    var _Promise = bingo.Promise,
        _attr = function (node, name, val) {
            if (arguments.length < 3)
                return node.getAttribute(name);
            else
                node.setAttribute(name, val)
        },
        _prop = function (node, name, val) {
            if (arguments.length < 3)
                return node[name];
            else
                node[name] = val;
        },
        _on = document.addEventListener,
        _off = document.removeEventListener,
        _val = function (node, val) {
            if (arguments.length < 2)
                return node.value;
            else
                node.value = val;
        },
        _valSel = function (node, val) {
            var one = node.type == 'select-one';
            if (one) {
                if (arguments.length < 2)
                    return node.value;
                else
                    node.value = val;
            } else {
                var options = node.options,
                    ret = [];
                if (arguments.length < 2) {
                    bingo.each(options, function (item) {
                        if (item.selected && !item.disabled)
                            ret.push(item.value);
                    });
                    return ret;
                } else {
                    bingo.isArray(val) || (val = [val]);
                    bingo.each(options, function (item) {
                        item.selected = (val.indexOf(item.value) >= 0);
                    });
                }
            }
        };


    var _getComputedStyle = document.defaultView.getComputedStyle,
        _cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
        _dasherize = function(str) {
            return str.replace(/::/g, '/')
                   .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                   .replace(/_/g, '-')
                   .toLowerCase();
        },
        _maybeAddPx=function(name, value) {
            return (bingo.isNumeric(value) && !_cssNumber[_dasherize(name)]) ? value + "px" : value;
        },
        _css = function (node, property, value) {
            var argLen = arguments.length;
            if (argLen < 3) {
                return argLen == 1 ? undefined : node.style[_dasherize(property)] || _getComputedStyle(node, '').getPropertyValue(_dasherize(property));
            }

            var css = null;
            property = _dasherize(property);
            if (value == '')
                node.style.removeProperty(property);
            else
                css = property + ":" + _maybeAddPx(property, value);

            css && (node.style.cssText += ';' + css);
        },
        _getshow = function (node) {
            var name = '_bgshow_';
            return name in node ? node[name] : (node[name] = _css(node, 'display'));
        },
        _show = function (node) {
            var sh = _getshow(node);
            _css(node, 'display', sh == 'none' ? 'block' : sh);
        },
        _hide = function (node) {
            _getshow(node);
            _css(node, 'display', 'none');
        },
        _spaceRE = /\s+/g,
        _getClass = function (node) {
            var cn = node.className;
            return cn ? cn.split(_spaceRE) : [];
        },
        _setClass = function (node, classNames) {
            var cn = classNames.join(' ');
            (cn == node.className) || (node.className = cn);
        },
        _hasClass = function (classNames, name) {
            return name ? classNames.indexOf(name) >= 0 : false;
        },
        _addClass = function (classNames, name) {
            _hasClass(classNames, name) || classNames.push(name);
        },
        _removeClass = function (classNames, name) {
            if (!_hasClass(classNames, name)) return classNames;
            return classNames.filter(function (item) {
                return item != name;
            });
        };

    /*
        使用方法:
        bg-controller="function($view){}"   //直接绑定一个function
        bg-controller="ctrl/system/user"    //绑定到一个url
    */

    bingo.each(['bg-controller', 'bg-controller-add'], function (cmdName) {
        var _isAdd = cmdName == 'bg-controller-add';

        bingo.command(cmdName, function () {

            return {
                //优先级, 越小越前, 默认50
                priority: _isAdd ? 5 : 1,
                //模板, 可以是引用id, url, html和node节点
                //tmpl:'#div1'
                //tmpl:'tmpl/test.thml'
                //tmpl:'<div>{{text1}}</div>'
                //tmpl:document.body  //==> document.body.innerHTML
                tmpl: '',
                //是否替换节点, 默认为false
                replace: false,
                //是否indclude, 默认为false, 模板内容要包函{{bg-include}}
                include: false,
                //是否新view, 默认为false
                view: !_isAdd,
                //是否编译子节点, 默认为true
                compileChild: _isAdd,
                //编译前, 主要用于dom的重新改造, 只能注入$view/node/$ajax...
                //如果view == true , 注入的view属于上层, 原因是新view还没解释出来, 还处于分析
                //compilePre还可以修改本定义属性
                compilePre: null,
                //controller
                compile: null,
                //link
                link: null,
                //编译, 这时还没有appendTo文档，最好不要处理事件之类的
                //compilePre编译前-->command.controller初始数据-->view.controller-->compile编译-->插入到document-->link连接command)-->init-->ready
                controller: ['$view', '$compile', 'node', '$attr', function ($view, $compile, node, $attr) {
                    var attrVal = $attr.content, val = null,
                        name = _attr(node, 'bg-name'),
                        pView = $view.$parentView();
                    if (!bingo.isNullEmpty(attrVal)) {
                        if (pView.bgTestProps(attrVal))
                            val = pView.bgDataValue(attrVal);
                        else if (window.bgTestProps(attrVal))
                            val = window.bgDataValue(attrVal);
                    }

                    var cmp = function () {
                        return !_isAdd && bingo.usingAll().then(function () {
                            return $view.bgIsDispose || $compile().nodes(node.childNodes).compile();
                        });
                    };

                    if (bingo.isNullEmpty(attrVal)
                        || bingo.isFunction(val) || bingo.isArray(val)) {
                        //如果是function或数组, 直接当action, 或是空值时
                        //添加controller
                        val && $view.$addController(val, name, attrVal);
                        //编译
                        return cmp();
                    } else {
                        //使用url方式, 异步加载action, 走mvc开发模式
                        var url = attrVal;

                        var routeContext = bingo.routeContext(url);
                        var context = routeContext.context();

                        if (context.controller) {
                            //如果controller不为空, 即已经定义controller
                            //设置app
                            $view.$setApp(context.app);
                            //添加controller
                            $view.$addController(context.controller, name, attrVal);
                            //编译
                            return cmp();
                        } else {
                            //如果找不到controller, 加载js
                            return bingo.using(url).then(function () {
                                if ($view.bgIsDispose) return;
                                var context = routeContext.context();
                                if (context.controller) {
                                    //设置app
                                    $view.$setApp(context.app);
                                    //添加controller
                                    $view.$addController(context.controller, name, attrVal);
                                    //编译
                                    return cmp();
                                }
                            });
                        }
                    }
                }]  //end controller
            };
        });
    }); // end bg-controller

    //bg-init初始数据用, bg-load节点准备好了。
    bingo.each(['bg-init', 'bg-load'], function (cName) {
        var priority = cName == 'bg-load' ? 999999 : 3;
        bingo.command(cName, function () {
            var cmd = {
                priority: priority
            };
            cmd[cName == 'bg-load' ? 'link' : 'compile'] = ['$attr', function ($attr) {
                $attr.$eval();
            }];
            return cmd;
        });
    }); //end bg-init

    bingo.command('bg-not-compile', function () {
        return {
            //是否编译子节点, 默认为true
            compileChild: false
        };
    });// end bg-not-compile

    bingo.command('bg-node', function () {
        return {
            compile: ['$attr', function ($attr) {
                $attr.$value($attr.node);
            }]
        };
    }); //end bg-node

    bingo.command('bg-text', function () {
        return {
            compile: ['$attr', 'node', function ($attr, node) {
                $attr.$layout(function (c) {
                    node.textContent = c.value;
                });
            }]
        };
    }); //end bg-text

    bingo.command('bg-html', function () {
        return {
            compile: ['$attr', '$viewnode', function ($attr, $viewnode) {
                $attr.$layout(function (c) {
                    return $viewnode.$html(c.value);
                });
            }]
        };
    }); //end bg-html

    bingo.command('bg-include', function () {
        return {
            compile: ['$attr', '$viewnode', '$tmpl', function ($attr, $viewnode, $tmpl) {

                var _html = function (p) {
                    return $tmpl(p).then(function (html) {
                       return $attr.bgIsDispose || $viewnode.$html(html);
                    });
                };

                if ($attr.$hasProps())
                    $attr.$layoutValue(function (c) {
                        return $viewnode.$html(c.value);
                    });
                else
                    return _html($attr.content);
            }]
        };
    }); //end bg-include

    bingo.command('bg-if', function () {
        return {
            compileChild: false,
            compile: ['$attr', '$viewnode', 'node', '$tmpl', function ($attr, $viewnode, node, $tmpl) {
                return $tmpl(node).then(function (html) {

                    var _set = function (value) {
                        if (value) {
                            return $viewnode.$html(html).then(function () { _show(node); });
                        } else
                            _hide(node);
                    };

                    $attr.$layout(function (c) {
                        return _set(c.value);
                    });
                });
            }]
        };
    }); //end bg-if

    /*
        使用方法:
        bg-attr="{src:'text.html', value:'ddd'}"
        bg-prop="{disabled:false, checked:true}"
        bg-checked="true" //直接表达式
        bg-checked="helper.checked" //绑定到变量, 双向绑定
    */
    bingo.each('attr,prop,src,checked,unchecked,disabled,enabled,readonly,class'.split(','), function (attrName) {
        bingo.command('bg-' + attrName, function () {

            return {
                compile: ['$view', '$attr', 'node', function ($view, $attr, node) {

                    var _set = function (val) {
                        switch (attrName) {
                            case 'attr':
                                //bg-attr="{src:'text.html', value:'ddd'}"
                                bingo.eachProp(val, function (item, n) {
                                    _attr(node, n, item);
                                });
                                break;
                            case 'prop':
                                bingo.eachProp(val, function (item, n) {
                                    _prop(node, n, item);
                                });
                                break;
                            case 'enabled':
                                _prop(node, 'disabled', !val);
                                break;
                            case 'unchecked':
                                _prop(node, 'checked', !val);
                                break;
                            case 'disabled':
                            case 'readonly':
                            case 'checked':
                                _prop(node, attrName, val);
                                break;
                            case 'class':
                                var classNames = _getClass(node);
                                if (bingo.isObject(val)) {
                                    bingo.eachProp(val, function (item, n) {
                                        if (bingo.isString(item))
                                            _addClass(classNames, item);
                                        else
                                            item ? _addClass(classNames, n) : (classNames = _removeClass(classNames, n));
                                    });
                                } else
                                    val && _addClass(classNames, val);
                                _setClass(node, classNames);
                                break;
                            default:
                                _attr(node, attrName, val);
                                break;
                        }

                    };

                    $attr.$layout(function (c) {
                        _set(c.value);
                    });

                    if (attrName == 'checked' || attrName == 'unchecked') {
                        var fn = function () {
                            var value = _prop(node, 'checked');
                            $attr.$value(attrName == 'checked' ? value : !value);
                        };
                        //如果是checked, 双向绑定
                        _on.call(node, 'click', fn);
                        $attr.bgOnDispose(function () {
                            _off.call(node, 'click', fn);
                        });
                    }

                }]
            };
        });
    }); //end attrs


    /*
        使用方法:
        bg-event="{click:function(e){}, dblclick:helper.dblclick, change:['input', helper.dblclick]}"
        bg-click="helper.click"     //绑定到方法
        bg-click="['input', helper.click]"     //绑定到数组, 等效于$().on('click', 'input', helper.click)
        bg-click="helper.click()"   //直接执行方法
    */
    bingo.each('event,click,blur,change,dblclick,focus,focusin,focusout,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,resize,scroll,select,submit,contextmenu'.split(','), function (eventName) {
        bingo.command('bg-' + eventName, function () {

            return ['$view', 'node', '$attr', function ($view, node, $attr) {

                var _bindList = [], bind = function (evName, callback) {
                    var fn = function () {
                        $view.$updateAsync();
                        return callback.apply(this, arguments);
                    };
                    _bindList.push([evName, fn]);
                    _on.call(node, evName, fn);
                };
                $attr.bgOnDispose(function () {
                    bingo.each(_bindList, function (item) {
                        _off.call(node, item[0], item[1]);
                    });
                });

                if (eventName != 'event') {
                    var fn = /^\s*\[(.|\n)*\]\s*$/g.test($attr.content) ? $attr.$results() : $attr.$value();
                    if (!bingo.isFunction(fn) && !bingo.isArray(fn))
                        fn = function (e) { return $attr.$eval(e); };
                    bind(eventName, fn);
                } else {
                    var evObj = $attr.$results();
                    if (bingo.isObject(evObj)) {
                        bingo.eachProp(evObj, function (fn, n) {
                            bind(n, fn);
                        });
                    }
                }

            }];

        });
    }); //end event

    /*
        使用方法:
        bg-style="{display:'none', width:'100px'}"
        bg-show="true"
        bg-show="res.show"
    */
    bingo.each('style,show,hide,visible'.split(','), function (attrName) {
        bingo.command('bg-' + attrName, function () {

            return {
                compile: ['$attr', 'node', function ($attr, node) {

                    var _set = function (val) {

                        switch (attrName) {
                            case 'style':
                                //bg-style="{display:'none', width:'100px'}"
                                bingo.eachProp(val, function (item, n) {
                                    _css(node, n, item);
                                });
                                break;
                            case 'hide':
                                val = !val;
                            case 'show':
                                if (val) _show(node); else _hide(node);
                                break;
                            case 'visible':
                                val = val ? 'visible' : 'hidden';
                                _css(node, 'visibility', val);
                                break;
                            default:
                                _css(node, attrName, val);
                                break;
                        }
                    };

                    $attr.$layout(function (c) {
                        _set(c.value);
                    });

                }]
            };

        });
    }); //end style

    bingo.command('bg-model', function () {

        return {
            compile: ['$view', 'node', '$attr', function ($view, node, $attr) {


                var _type = _attr(node, 'type'),
                    _isRadio = _type == 'radio',
                    _isCheckbox = _type == 'checkbox',
                    _checkboxVal = _isCheckbox ? _val(node) : null,
                    _isSelect = node.tagName.toLowerCase() == 'select';

                var _getElementValue = function () {
                    return _isCheckbox ? (_prop(node, "checked") ? _checkboxVal : '') : (_isSelect ? _valSel(node) : _val(node));
                }, _setElementValue = function (value) {
                    value = _isSelect && bingo.isArray(value) ? value : bingo.toStr(value);
                    if (_isCheckbox) {
                        _prop(node, "checked", (_val(node) == value));
                    } else if (_isRadio) {
                        _prop(node, "checked", (_val(node) == value));
                    } else if (_isSelect)
                        _valSel(node, value);
                    else
                        _val(node, value);
                };

                var _eVal, eName, fn = function () {
                    var value = _getElementValue();
                    if (_eVal != value || _isRadio) {
                        _eVal = value;
                        $attr.$value(value);
                    }
                };
                if (_isRadio) {
                    eName = 'click';
                } else {
                    eName = 'change';
                    _on.call(node, 'change', fn);
                }
                if (eName) {
                    _on.call(node, eName, fn);
                    $attr.bgOnDispose(function () {
                        _off.call(node, eName, fn);
                    });
                }

                $attr.$layoutValue(function (c) {
                    var val = c.value;
                    _setElementValue(val);
                });

            }]
        };

    });//end model


    /*
        使用方法:
        bg-for="item in user.list"

        例:
        <select bg-for="item in list">
            ${if item.id == 1}
            <option value="${item.id}">text_${item.text}</option>
            ${else}
            <option value="${item.id}">text_${item.text}eee</option>
            ${/if}
        </select>
    */

    //bg-for
    //bg-for="datas"  ==等效==> bg-render="item in datas"
    //bg-for="item in datas"
    //bg-for="item in datas tmpl=#tmplid"    //tmpl以#开头认为ID
    //bg-for="item in datas tmpl=view/user/listtmpl"  //tmpl不以#开头认为url, 将会异步加载
    //bg-for="item in datas | asc"
    //bg-for="item in datas | asc tmpl=#tmplid"
    bingo.command('bg-for', function () {
        return {
            priority: 10,
            compileChild: false,
            compile: ['$view', '$compile', 'node', '$attr', '$tmpl', function ($view, $compile, node, $attr, $tmpl) {

                var attrData = _makeBindContext($attr);

                if (!attrData) return;
                var _itemName = attrData.itemName,
                    _tmpl = attrData.tmpl;

                _tmpl || $tmpl(node).then(function (s) {
                    _tmpl = s;
                });

                var _render = function (tmpl, datas) {
                    return $view.bgIsDispose || $compile().render(tmpl, datas, _itemName, $attr.withData).htmlTo(node).compile().then(function () {
                        if ($view.bgIsDispose) return;
                        var m = $attr.viewnode.$getAttr('bg-model');
                        m && m.$publish();
                    });
                };
                $attr.$layout(function (c) {
                    var t = c.value,
                        isL  =bingo.isArray(t),
                        datas = isL ?t : bingo.sliceArray(t);
                    (!isL) && datas.length == 0 && (datas = t ? [t] : []);
                    return $tmpl(_tmpl).then(function (s) {
                        return _render(s, datas);
                    });
                    //return 'bg-for aaaaaaaaaaa';
                });

            }]
        };

    }); //end bg-for

    var _renderReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/,
        _makeBindContext = function ($attr) {
            var code = $attr.content;
            if (bingo.isNullEmpty(code))
                code = 'item in {}';
            if (!_renderReg.test(code)) {
                code = ['item in ', code].join('');
            }
            var _itemName = '', _dataName = '', _tmpl = '';
            //分析item名称, 和数据名称
            code.replace(_renderReg, function () {
                _itemName = arguments[1];
                _dataName = arguments[2];
                _tmpl = bingo.trim(arguments[3]);

                if (bingo.isNullEmpty(_dataName))
                    _dataName = arguments[4];
            });

            $attr.content = _dataName;

            return {
                itemName: _itemName,
                dataName: _dataName,
                tmpl: _tmpl
            };
        }; //end _makeBindContext

    //end bg-for 

    bingo.each(['bg-component', 'bg:component'], function (cmdName) {
        var isInner = (cmdName == 'bg-component');
        bingo.command(cmdName, function () {

            return {
                priority: 3,
                view: true,
                compileChild: false,
                replace: true,
                include: false,
                compilePre: ['$view', 'node', '$inject', function (pView, node, $inject) {
                    var attrVal = _attr(node, isInner ? 'bg-component' : 'bg-src'),
                        val, compName = _attr(node, 'bg-name') || bingo.makeAutoId();

                    if (!bingo.isNullEmpty(attrVal)) {
                        if (pView.bgTestProps(attrVal))
                            val = pView.bgDataValue(attrVal);
                        else if (window.bgTestProps(attrVal))
                            val = window.bgDataValue(attrVal);
                    }
                    var init = function (def) {
                        def = bingo.isFunction(def) ? $inject(def) : def;
                        pView.$compileComp(def, node, compName);
                        //取得定义后， 得到$tmpl
                        this.tmpl = def.$tmpl || node;
                        this._bgcompdef_ = { def: def, name: compName };
                    }.bind(this);

                    if (val) {
                        return init(val);
                    } else {
                        //使用url方式, 异步加载action, 走mvc开发模式
                        var url = attrVal;

                        var routeContext = bingo.routeContext(url);
                        var context = routeContext.context();

                        if (context.component) {
                            return init(context.component);
                        } else {
                            return bingo.using(url).then(function () {
                                if (pView.bgIsDispose) return;
                                routeContext = bingo.routeContext(url);
                                context = routeContext.context();
                                if (context.component) {
                                    return init(context.component);
                                }
                            });
                        }
                    }
                }],
                controller: ['$view', '$compile', 'node', '$attr', function ($view, $compile, node) {
                    var pView = $view.$parentView(),
                        comdef = this._bgcompdef_,
                        def = comdef.def,
                        compName = comdef.name;
                   
                    $view.bgOnDispose(function () {
                        pView.$removeComp(compName);
                    });
                    if (def) {
                        var co = $view.$initComp(def, compName);
                        co.bgToObserve();
                        return $compile().nodes([node]).compile();
                    }

                }]  //end compile
            };

        }); //end bg-component

    });//end each bg-component

    
})(bingo);
