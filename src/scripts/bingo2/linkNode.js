
; (function (bingo) {
    "use strict";

    //IE必须先添加到document才生效
    var _ev = 'DOMNodeRemoved', _aT,
        _getCommentNodes = function (e) {
            var r = [], o, s;
            s = document.createTreeWalker(e, NodeFilter.SHOW_COMMENT, null, null);
            while (o = s.nextNode()) r.push(o); //遍历迭代器
            return r;
        };
    //window.getCommentNodes = _getCommentNodes;
    document.documentElement.addEventListener(_ev, function (e) {
        var target = e.target;
        setTimeout(function () {
            var parentNode = target ? target.parentNode : null;
            if (!parentNode) {
                target.bgTrigger(_ev, [e]);
                _aT || (_aT = setTimeout(function () { _aT = null; _linkAll.bgTrigger('onLinkNodeAll'); }, 0));
                target.hasChildNodes() && bingo.each(bingo.sliceArray(target.querySelectorAll('*')).concat(_getCommentNodes(target)), (function () {
                    this.bgTrigger(_ev, [e]);
                }));
            }
        }, 0);
    }, false);

    bingo.linkNode = function (node, callback) {
        if (callback) {
            if (!node) { callback(); return; }
            node.bgOne(_ev, callback);
        }
    };

    bingo.unLinkNode = function (node, callback) {
        if (node) {
            if (callback)
                node.bgOff(_ev, callback);
            else
                node.bgOff();
        }
    };

    Object.prototype.bgDefProps({
        bgLinkNode: function (node) {
            var fn = bingo.proxy(this, function () {
                this.bgDispose();
            });
            bingo.linkNode(node, fn);
            (this._linkNodeFn || (this._linkNodeFn = [])).push(fn);
            this.bgOnDispose(function () { this.bgUnLinkNode(node); });
            return this;
        },
        bgUnLinkNode: function (node) {
            var fnL = this._linkNodeFn;
            fnL && fnL.length > 0 && fnL.forEach(function (item) {
                bingo.unLinkNode(this, item);
            }, node);
            this._linkNodeFn = [];
            return this;
        },
        bgLinkNodeAll: function (fn) {
            if (fn) {
                var $this = this, fn1 = function () {
                    fn.apply($this, arguments);
                    $this.bgIsDispose && _linkAll.bgUnLinkNodeAll(fn1);
                };
                fn._bglfall_ = fn1;
                _linkAll.bgOn('onLinkNodeAll', fn1);
            }
        },
        bgUnLinkNodeAll: function (fn) {
            fn && _linkAll.bgOff('onLinkNodeAll', fn._bglfall_);
        }
    });
    var _linkAll = {};

})(bingo);
