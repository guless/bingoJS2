(function (bingo) {
    "use strict";
    bingo.linq = function (list) {
        return new _linqCls(list);
    };

    var _linqCls = bingo.linq.$class = bingo.Class(function () {
        this.Define({
            each: function (fn) {
                /// <param name="fn" type="function(item, index, array)"></param>
                bingo.each(this._datas, fn);
                return this;
            },
            where: function (fn) {
                /// <param name="fn" type="function(item, index, array)"></param>
                if (!bingo.isFunction(fn)) {
                    var name = fn, value = arguments[1];
                    fn = function () { return this[name] == value; };
                }
                this._datas = this._datas.filter(fn);
                return this;
            },
            select: function (fn) {
                /// <param name="fn" type="function(item, index, array)"></param>
                if (!bingo.isFunction(fn)) {
                    var name = fn, value = arguments[1];
                    fn = function () { return this[name] == value; };
                }
                this._datas = this._datas.map(fn);
                return this;
            },
            contain: function () {
                /// <summary>
                /// 是否存在数据
                /// </summary>
                return this._datas && this._datas.length > 0;
            },
            sort: function (fn) {
                /// <summary>
                /// 排序, sort(function(item1, item2){return item1-item2;})<br />
                /// item1 - item2:从小到大排序<br />
                /// item2 - item1:从大到小排序<br />
                /// item1 大于 item2:从小到大排序<br />
                /// item1 小于 item2:从大到小排序
                /// </summary>
                /// <param name="fn" type="function(item1, item2)"></param>
                this._datas = this._datas.sort(function (item1, item2) {
                    var n = fn(item1, item2);
                    return n > 0 || n === true ? 1 : (n < 0 || n === false ? -1 : 0);
                });
                return this;
            },
            unique: function (fn) {
                /// <summary>
                /// 去除重复<br />
                /// 用法1. unique()<br />
                /// 用法2. unique('prop')<br />
                /// 用法3. unique(function(item, index){ return item.prop; });
                /// </summary>
                /// <param name="fn" type="function(item, index)">可选</param>
                var list = [], hasList = [];

                if (!bingo.isFunction(fn)) {
                    if (arguments.length == 0)
                        fn = function (item) { return item; };
                    else {
                        var prop = fn;
                        fn = function (item) { return item[prop]; };
                    }
                }
                this.each(function (item, index) {
                    var o = fn.call(item, item, index);
                    if (bingo.inArray(o, hasList) < 0) {
                        list.push(item);
                        hasList.push(o);
                    }
                });
                this._datas = list;
                return this;
            },
            count: function () { return this._datas.length; },
            first: function (defaultValue) {
                /// <summary>
                /// 查找第一个数据
                /// </summary>
                /// <param name="defaultValue">可选, 默认值, 如果没有查找到时</param>
                return this._datas[0] || defaultValue;
            },
            last: function (defaultValue) {
                /// <summary>
                /// 查找最后一个数据
                /// </summary>
                /// <param name="defaultValue">可选, 默认值, 如果没有查找到时</param>
                return this._datas[0] || defaultValue;
            },
            index: function () {
                var bl = this._datas;
                var d = this.first();
                return bingo.inArray(d, bl);
            },
            toArray: function () { return this._datas; }
        });
        this.Init(function (p) {
            this._datas = bingo.toArray(p);
        });
    });


})(bingo);
