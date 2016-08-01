﻿
(function (bingo) {
    "use strict";

    var defualtApp = bingo.defualtApp;
    bingo.app.extend({
        _attr:{},
        attr: function (name, fn) {
            if (arguments.length == 1)
                return this._attr[name] || defualtApp._attr[name] || defualtApp._attr[_vAttrDefaultName];
            else
                this._attr[name] = fn;
        }
    });

    //默认attr
    var _vAttrDefaultName = 'bg_default_vattr',
        _isEvent = /^\s*on/i;
    defualtApp.attr(_vAttrDefaultName, function (vAttr) {

        var name = vAttr.$name, view = vAttr.$view;

        if (_isEvent.test(name)) {
            var eventName = name.replace(_isEvent, ''),
                bind = function (evName, callback) {
                    var fn = function () {
                        view.$updateAsync();
                        return callback.apply(this, arguments);
                    };
                    vAttr.$on(evName, fn);
                };

            var fn = /^\s*\[(.|\n)*\]\s*$/g.test(vAttr.$contents) ? vAttr.$result() : vAttr.$value();
            if (!bingo.isFunction(fn) && !bingo.isArray(fn))
                fn = function (e) { return vAttr.$eval(e); };
            bind(eventName, fn);
            return;
        }

        vAttr.$layoutResult(function (c) {
            if (name == 'value' && vAttr.$is('option')) {
                var vNode = vAttr.$parent('select');
                if (vNode && vNode.$attrs.model)
                    if (vNode.$attrs.model.$value() == c.value) vAttr.$prop('selected', true);
            }
            vAttr.$attr(name, c.value);
        });

    });

    defualtApp.attr('node', function (vAttr) {

        vAttr.$init(function () {
            vAttr.$value(vAttr.$node);
        });

    });

    bingo.each('checked,unchecked,disabled,enabled,readonly'.split(','), function (attrName) {
        defualtApp.attr(attrName, function (vAttr) {

            var _set = function (val) {
                switch (attrName) {
                    case 'enabled':
                        vAttr.$prop('disabled', !val);
                        break;
                    case 'unchecked':
                        vAttr.$prop('checked', !val);
                        break;
                    default:
                        vAttr.$prop(attrName, val);
                        break;
                }
            };

            vAttr.$layoutResult(function (c) {
                _set(c.value);
            });

            if (attrName == 'checked' || attrName == 'unchecked') {
                var fn = function () {
                    var value = vAttr.$prop('checked');
                    vAttr.$value(attrName == 'checked' ? value : !value);
                };
                //如果是checked, unchecked, 双向绑定
                vAttr.$on('click', fn);
            }

        });
    });
    bingo.each('show,hide,visible'.split(','), function (attrName) {
        defualtApp.attr(attrName, function (vAttr) {

            var _set = function (val) {

                switch (attrName) {
                    case 'hide':
                        val = !val;
                    case 'show':
                        if (val) vAttr.$show(); else vAttr.$hide();
                        break;
                    case 'visible':
                        val = val ? 'visible' : 'hidden';
                        vAttr.$css('visibility', val);
                        break;
                }
            };

            vAttr.$layoutResult(function (c) {
                _set(c.value);
            });

        });
    });

    defualtApp.attr('model', function (vAttr) {

        var _val = function (val) {
            if (arguments.length == 0)
                return vAttr.$attr('value');
            else
                vAttr.$attr('value', val);
        };

        var node = vAttr.$node;

        var _type = vAttr.$attr('type'),
            _isRadio = _type == 'radio',
            _isCheckbox = _type == 'checkbox',
            _checkboxVal = _isCheckbox ? _val(node) : null,
            _isSelect = node.tagName.toLowerCase() == 'select';

        var _getNodeValue = function () {
            return _isCheckbox ? (vAttr.$prop("checked") ? _checkboxVal : '') : (_val());
        }, _setNodeValue = function (value) {
            value = _isSelect && bingo.isArray(value) ? value : bingo.toStr(value);
            if (_isCheckbox) {
                vAttr.$prop("checked", (_val() == value));
            } else if (_isRadio) {
                vAttr.$prop("checked", (_val() == value));
            } else if (_isSelect)
                _val(value);
            else
                _val(value);
        };

        var _eVal, eName, fn = function () {
            var value = _getNodeValue();
            if (_eVal != value || _isRadio) {
                _eVal = value;
                vAttr.$value(value);
            }
        };
        if (_isRadio) {
            eName = 'click';
        } else {
            eName = 'change';
        }
        if (eName) {
            vAttr.$on(eName, fn);
        }

        vAttr.$layoutValue(function (c) {
            var val = c.value;
            _setNodeValue(val);
        });

        //vAttr.$ready(function () {
        //    _setNodeValue(vAttr.$value());
        //});

    });


})(bingo);
