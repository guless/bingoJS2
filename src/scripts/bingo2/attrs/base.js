
(function (bingo) {
    "use strict";

    bingo.each('checked,unchecked,disabled,enabled,readonly'.split(','), function (attrName) {
        bingo.attr(attrName, function (vAttr) {
            /// <param name="vAttr" value="_newVirtualAttr({}, 'name', 'value')"></param>

            var _set = function (val) {
                switch (attrName) {
                    case 'enabled':
                        vAttr.$propEx('disabled', !val);
                        break;
                    case 'unchecked':
                        vAttr.$propEx('checked', !val);
                        break;
                    default:
                        vAttr.$prop(val);
                        break;
                }
            };

            vAttr.$layout(function (c) {
                _set(c.value);
            });

            if (attrName == 'checked' || attrName == 'unchecked') {
                var fn = function () {
                    var value = vAttr.$propEx('checked');
                    vAttr.$value(attrName == 'checked' ? value : !value);
                };
                //如果是checked, unchecked, 双向绑定
                vAttr.$on('click', fn);
            }

            return vAttr;
        });
    });
    bingo.each('show,hide,visible'.split(','), function (attrName) {
        bingo.attr(attrName, function (vAttr) {
            /// <param name="vAttr" value="_newVirtualAttr({}, 'name', 'value')"></param>
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

            $attr.$layout(function (c) {
                _set(c.value);
            });

            return vAttr;
        });
    });

    bingo.each('model,value'.split(','), function (attrName) {
        bingo.attr(attrName, function (vAttr) {
            /// <param name="vAttr" value="_newVirtualAttr({}, 'name', 'value')"></param>

            var node = vAttr.$node, isVal = attrName == 'value';

            var _type = vAttr.$attrEx('type'),
                _isRadio = _type == 'radio' && !isVal,
                _isCheckbox = _type == 'checkbox' && !isVal,
                _checkboxVal = _isCheckbox ? _val(node) : null,
                _isSelect = node.tagName.toLowerCase() == 'select';

            var _val = function (val) {
                if (arguments.length == 0)
                    return vAttr.$attrEx('value');
                else
                    vAttr.$attrEx('value', val);
            }

            var _getNodeValue = function () {
                return _isCheckbox ? (vAttr.$propEx("checked") ? _checkboxVal : '') : (_val());
            }, _setNodeValue = function (value) {
                value = _isSelect && bingo.isArray(value) ? value : bingo.toStr(value);
                if (_isCheckbox) {
                    vAttr.$propEx("checked", (_val() == value));
                } else if (_isRadio) {
                    vAttr.$propEx("checked", (_val() == value));
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

            return vAttr;
        });
    });



})(bingo);
