/// <reference path="../src/helper.js" />

describe('core --- bingoJS ' + bingo.version , function () {

    var undefined, $ = jLite;
    function fnTTTT() { };

    it('try catch', function () {
        //测试有些版本 try没有catch不执行finally问题
        var count = 0;
        try {
            try {
                throw (new Error('aaaa'));
                count++;
            } finally {
                count++;
            }
        } catch (e) {
        }
        expect(count).toEqual(1);

        count = 0;
        var testTry = (function () {
            try {
                return 2;
            } finally {
                count++;
            }
        })();
        expect(count).toEqual(1);
        expect(testTry).toEqual(2);

       
    }); //end try catch

    it('defineProperties exist', function () {

        expect(Object.defineProperties).toBeDefined();

        expect(Object.defineProperty).toBeDefined();

        expect(Object.getOwnPropertyDescriptor).toBeDefined();
    }); //end defineProperties exist


    describe('类型判断 ======>', function () {

        it('类型判断所要的方法是否正常', function () {
            expect([0, 1, 2].indexOf(1)).toEqual(1);
            expect(bingo['isUndefined']).toEqual(bingo.isUndefined);
        });

        //trueList:(true的数组), 如: [0,12](0或12为true)
        var testIsFn = function (fnName, trueList) {
            expect(bingo[fnName](null)).toEqual(testIsTrue(0, trueList));
            expect(bingo[fnName](false)).toEqual(testIsTrue(1, trueList));
            expect(bingo[fnName](1)).toEqual(testIsTrue(2, trueList));
            expect(bingo[fnName](1.11)).toEqual(testIsTrue(3, trueList));
            expect(bingo[fnName]('1')).toEqual(testIsTrue(4, trueList));
            expect(bingo[fnName]([1, 2])).toEqual(testIsTrue(5, trueList));
            expect(bingo[fnName]({ a: 1 })).toEqual(testIsTrue(6, trueList));
            expect(bingo[fnName](new Object())).toEqual(testIsTrue(7, trueList));
            expect(bingo[fnName](/a/gi)).toEqual(testIsTrue(9, trueList));
            expect(bingo[fnName](new RegExp())).toEqual(testIsTrue(10, trueList));
            expect(bingo[fnName](document.documentElement)).toEqual(testIsTrue(11, trueList));
            expect(bingo[fnName](document)).toEqual(testIsTrue(12, trueList));
            expect(bingo[fnName](window)).toEqual(testIsTrue(13, trueList));
            expect(bingo[fnName](undefined)).toEqual(testIsTrue(14, trueList));
            expect(bingo[fnName](new String('1'))).toEqual(testIsTrue(15, trueList));
            expect(bingo[fnName]('')).toEqual(testIsTrue(16, trueList));
            expect(bingo[fnName](function () { })).toEqual(testIsTrue(17, trueList));
            expect(bingo[fnName](new Function('var a = 1;'))).toEqual(testIsTrue(18, trueList));
            expect(bingo[fnName](fnTTTT)).toEqual(testIsTrue(19, trueList));
            expect(bingo[fnName](new Array())).toEqual(testIsTrue(20, trueList));

            var cls = function () { };
            cls.prototype.a = 1;
            expect(bingo[fnName](new cls())).toEqual(testIsTrue(21, trueList));

        }, testIsTrue = function (index, trueList) { return trueList.indexOf(index) >= 0 };



        it('bingo.isUndefined', function () {
            testIsFn('isUndefined', [14]);
        });

        it('bingo.isNull', function () {
            testIsFn('isNull', [0, 14]);
        });

        it('bingo.isBoolean', function () {
            testIsFn('isBoolean', [1]);
        });

        it('bingo.isNullEmpty', function () {
            testIsFn('isNullEmpty', [0, 14, 16]);
        });

        it('bingo.isFunction', function () {
            testIsFn('isFunction', [17, 18, 19]);
        });

        it('bingo.isNumeric', function () {
            testIsFn('isNumeric', [2, 3, 4, 15]);
        });

        it('bingo.isString', function () {
            testIsFn('isString', [4, 15, 16]);
        });

        it('bingo.isObject', function () {
            testIsFn('isObject', [6, 7, 21]);
            //testIsFn('isObject', [6, 7, 8, 11, 12, 13]);
        });

        it('bingo.isPlainObject', function () {
            testIsFn('isPlainObject', [6, 7]);
        });


        it('bingo.isArray', function () {
            testIsFn('isArray', [5, 20]);
        });

        it('bingo.isWindow', function () {
            testIsFn('isWindow', [13]);
        });

        it('bingo.isElement', function () {
            testIsFn('isElement', [11, 12]);
        });

    }); //end describe 类型判断

    describe('常用方法 ======>', function () {

        //去前后空白
        it('bingo.trim', function () {
            expect(bingo.trim(' a   ')).toEqual('a');
            expect(bingo.trim(' a b ')).toEqual('a b');
            expect(bingo.trim(' a b')).toEqual('a b');
            expect(bingo.trim('a b ')).toEqual('a b');
            expect(bingo.trim(' a b　')).toEqual('a b');//全角空白
            expect(bingo.trim(undefined)).toEqual('');
            expect(bingo.trim(null)).toEqual('');
            expect(bingo.trim(1)).toEqual('1');
        });

        it('bingo.replaceAll', function () {
            expect(bingo.replaceAll(' \\ ', ' \\ ', '')).toEqual('');
            expect(bingo.replaceAll(' aaa ', ' AAA ', '')).toEqual(' aaa ');
            expect(bingo.replaceAll('Aa', 'a', '')).toEqual('A');
            expect(bingo.replaceAll('Aa', 'a', '', 'i')).toEqual('a');
            expect(bingo.replaceAll('Aa', 'a', '', 'gi')).toEqual('');
            expect(bingo.replaceAll('你是AABB/?\\ddi是', '你是AABB/?\\ddi是', '', 'gi')).toEqual('');
        });

        it('bingo.toStr', function () {
            expect(bingo.toStr(null)).toEqual('');
            expect(bingo.toStr(undefined)).toEqual('');
            expect(bingo.toStr('')).toEqual('');
            expect(bingo.toStr(1)).toEqual('1');
            expect(bingo.toStr(1.11)).toEqual('1.11');
            expect(bingo.toStr(false)).toEqual('false');

            expect(bingo.toStr({})).not.toEqual('');
            expect(bingo.toStr([1])).not.toEqual('');
            expect(bingo.toStr(/i/g)).not.toEqual('');
            expect(bingo.toStr(window)).not.toEqual('');
            expect(bingo.toStr(document)).not.toEqual('');

        });

        it('bingo.makeAutoId', function () {
            var list = [];
            for (var i = 0; i < 100; i++) {
                list.push(bingo.makeAutoId());
            }
            expect(list.indexOf(bingo.makeAutoId())).toEqual(-1);
        });

        it('bingo.inArray', function () {
            var list = [0, 1, 2, 3];
            expect(bingo.inArray(4, list)).toEqual(-1);
            expect(bingo.inArray(0, list)).toEqual(0);
            expect(bingo.inArray(function (item) {return item == 2 }, list)).toEqual(2);
        });

        it('bingo.removeArrayItem', function () {
            var list = [0, 0, 1, 2, 3];
            expect(bingo.removeArrayItem(0, list)).toEqual([1, 2, 3]);//删除所有0
            expect(bingo.removeArrayItem(1, list)).toEqual([0, 0, 2, 3]);

            var objList = [{ a: 1 }, { a: 2 }];
            expect(bingo.removeArrayItem(objList[0], objList)).toEqual([{ a: 2 }]);
            expect(bingo.removeArrayItem({ a: 1 }, objList)).not.toEqual([{ a: 2 }]);//只是引用比较
        });

        it('bingo.sliceArray', function () {

            var list = [1, 2];

            expect(bingo.sliceArray(list)).toEqual(list);
            expect(bingo.sliceArray(list, 0)).toEqual(list);

            //测试arguments
            (function () {
                expect(bingo.sliceArray(arguments)).toEqual([1, 2]);
                expect(bingo.sliceArray(arguments, 1)).toEqual([2]);
                expect(bingo.sliceArray(arguments, 3)).toEqual([]);
            })(1, 2);

            //测试非数组
            expect(bingo.sliceArray({a:1}).length).toEqual(0);


            //测试parseHTML
            var node = $.parseHTML('<div test="1"><span></span><div><a></a></div></div>')[0];
            var all = node.querySelectorAll('*');
            expect(bingo.isArray(all)).toEqual(false);
            var count = all.length;
            list = bingo.sliceArray(all);
            expect(bingo.isArray(list)).toEqual(true);
            expect(list.length).toEqual(count);

            //测试attributes
            expect(bingo.isArray(node.attributes)).toEqual(false);
            count = node.attributes.length;
            list = bingo.sliceArray(node.attributes);
            expect(bingo.isArray(list)).toEqual(true);
            expect(list.length).toEqual(count);

        }); //end sliceArray

        //it('bingo.toArray', function () {
            
        //    var list = [1, 2];

        //    expect(bingo.toArray(list) === list).toEqual(true);

        //    (function () {
        //        expect(bingo.toArray(arguments)).toEqual([1, 2]);
        //    })(1, 2);


        //    var node = $.parseHTML('<div><span></span><div><a></a></div></div>')[0];
        //    var all = node.querySelectorAll('*');
        //    expect(bingo.isArray(all)).toEqual(false);

        //    var count = all.length;
        //    list = bingo.toArray(all);
        //    expect(bingo.isArray(list)).toEqual(true);
        //    expect(list.length).toEqual(count);

        //}); //end toArray

        it('bingo.each', function () {
            var list = [{ a: 1 }, { a: 2 }, { a: 3 }];
            bingo.each(list, function () {
                this.a++;
            });
            expect(list).toEqual([{ a: 2 }, { a: 3 }, { a: 4 }]);

            list = [{ a: 1 }, { a: 2 }, { a: 3 }];
            bingo.each(list, function () {
                this.a++;
                return false;
            });
            expect(list).toEqual([{ a: 2 }, { a: 2 }, { a: 3 }]);

            list = [{ a: 1 }];
            bingo.each(list, function (item, index, array) {
                expect(item === this).toEqual(true);
                expect(index).toEqual(0);
                expect(array === list).toEqual(true);
            });

            bingo.each(list, function (item, index, array) {
                expect(item != this).toEqual(true);
                expect(index).toEqual(0);
                expect(array === list).toEqual(true);
            }, {});

            //测试过程中改变， 结果不影响内容
            var lCount = 0;
            list = [{ a: 1 }, { a: 2 }];
            bingo.each(list, function (item, index, array) {
                lCount++;
                this.a++;
                list.push(this);
            });
            expect(lCount).toEqual(2);
            expect(list.length).toEqual(4);
        });

        it('bingo.eachProp', function () {

            var obj = { a: 1, b: 2 };

            var prop = [];
            bingo.eachProp(obj, function (item, n) {
                prop.push(n);
            });
            expect(prop.length).toEqual(2);
            expect(prop.indexOf('a') >= 0 && prop.indexOf('b') >= 0).toEqual(true);

            var cls = function () { this.a = 1; };
            cls.prototype.b = 2;
            obj = new cls();
            prop = [];
            bingo.eachProp(obj, function (item, n) {
                prop.push(n);
            });
            expect(prop.length).toEqual(1);
            expect(prop.indexOf('a') >= 0 && prop.indexOf('b') < 0).toEqual(true);

        });

        //it('bingo.clearObject', function () {
        //    //clearObject不清除原形属性

        //    var obj = { a: 1, b: 2 };
        //    bingo.clearObject(obj)
        //    expect(obj).toEqual({ a: null, b: null });

        //    var cls = function () { this.a = 1; };
        //    cls.prototype.b = 2;
        //    var obj1 = new cls();
        //    bingo.clearObject(obj1)
        //    expect(obj1.a).toEqual(null);
        //    //clearObject不清除原形属性b
        //    expect(obj1.b).toEqual(2);
        //    expect(obj1).not.toEqual({ a: null, b: null });

        //});

        //it('bingo.clone', function () {
        //    //只复制planeObject, 数组和基础JS类型, RegEx不复制

        //    var obj = { a: 1, b: 2, c: { nn: 11, mm: 22 }, list: [1, 2] };
        //    var obj1 = bingo.clone(obj);
        //    expect(obj).toEqual(obj1);
        //    expect(obj != obj1).toEqual(true);
        //    expect(obj.c != obj1.c).toEqual(true);
        //    expect(obj.list != obj1.list).toEqual(true);

        //    var list = [{ a: 1 }, 2];
        //    var list1 = bingo.clone(list, false, true);
        //    list1[1] = 3
        //    expect(list).not.toEqual(list1);


        //    //不复制以下内容, 直接返回
        //    expect(bingo.clone(window) === window).toEqual(true);
        //    expect(bingo.clone(document) === document).toEqual(true);
        //    expect(bingo.clone(document.documentElement) === document.documentElement).toEqual(true);

        //    var re = new RegExp();
        //    expect(bingo.clone(re) === re).toEqual(true);

        //    var cls = function () { };
        //    cls.prototype.a = cls;
        //    var o = new cls();
        //    expect(bingo.clone(o) === o).toEqual(true);


        //    var oc = { "a": 1, "b": { "a": 2, "b": { "a": 3 } } };
        //    var oc1 = bingo.clone(oc, true, true, 1);//复制1层
        //    expect(bingo.equals(oc, oc1)).toEqual(true);
        //    oc1.a = 2;
        //    expect(bingo.equals(oc, oc1)).toEqual(false);
        //    oc1.a = 1;
        //    oc1.b.a = 2;
        //    expect(bingo.equals(oc, oc1)).toEqual(true);

        //});

        it('bingo.proxy', function () {
            var obj = { a: 1, b: 2, c: { nn: 11, mm: 22 }, list: [1, 2] };

            var count = 0;
            var fn = bingo.proxy(obj, function () {
                expect(obj === this).toEqual(true);
                count++;
            });

            fn();
            fn.call(window);
            expect(count).toEqual(2);
        });

        it('bingo.extend', function () {
            //只有一个参数, 扩展到bingo
            bingo.extend({ __a: 222 });
            expect(bingo.__a === 222).toEqual(true);


            var obj = { a: 1, b: 2 };

            //2个参数以上, 扩展到第一个参数, 并返回第一个参数
            var obj1 = bingo.extend(obj, { __a: 1 });
            expect(bingo.__a !== 1 && obj.__a === 1).toEqual(true);
            expect(obj1).toEqual({ a: 1, b: 2, __a: 1 });

            bingo.extend(obj, { __a: 1 }, { __b: 2 });
            expect(bingo.__a !== 1 && obj.__a === 1 && obj.__b === 2).toEqual(true);

        });

        //it('bingo.datavalue', function () {
        //    var obj = {};
        //    expect(bingo.datavalue(obj, 'a.aa')).toEqual(undefined);

        //    //obj
        //    obj = {};
        //    bingo.datavalue(obj, 'a.aa', 1);
        //    expect(bingo.datavalue(obj, 'a.aa')).toEqual(1);
        //    expect(obj).toEqual({ a: { aa: 1 } });
        //    bingo.datavalue(obj, 'a.o["d"]', 2);
        //    expect(bingo.datavalue(obj, 'a.o["d"]')).toEqual(2);
        //    expect(obj).toEqual({ a: { aa: 1, o: { d: 2 } } });

        //    //数组
        //    obj = {};
        //    bingo.datavalue(obj, 'a.bb[0]', 2);
        //    expect(bingo.datavalue(obj, 'a.bb[0]')).toEqual(2);
        //    bingo.datavalue(obj, 'a.cc[1]', 3);
        //    expect(bingo.datavalue(obj, 'a.cc[0]')).toEqual(undefined);
        //    expect(bingo.datavalue(obj, 'a.cc[1]')).toEqual(3);
        //    expect(obj).toEqual({ a: { bb: [2], cc: [undefined, 3] } });

        //});

        //it('bingo.equals', function () {
        //    var t = new Date();
        //    var obj = {
        //        nul: null, und: undefined, n: 1, nn: 1.01, z: 0,
        //        s: 'a', ss: new String('b'), se: '',
        //        b: true,
        //        reg: /i/g, regx: new RegExp('iii', 'gi'),
        //        d: t
        //    };
        //    var obj1 = {
        //        nul: null, und: undefined, n: 1, nn: 1.01, z: 0,
        //        s: 'a', ss: new String('b'), se: '',
        //        b: true,
        //        reg: /i/g, regx: new RegExp('iii', 'gi'),
        //        d: t
        //    };

        //    expect(bingo.equals(obj, obj1)).toEqual(true);

        //    obj.nul = 1;
        //    expect(bingo.equals(obj, obj1)).toEqual(false);

        //    obj.nul = obj1.nul;
        //    expect(bingo.equals(obj, obj1)).toEqual(true);
        //    obj.und = 1;
        //    expect(bingo.equals(obj, obj1)).toEqual(false);


        //    obj.und = obj1.und;
        //    expect(bingo.equals(obj, obj1)).toEqual(true);
        //    obj.reg = /sdfs/g;
        //    expect(bingo.equals(obj, obj1)).toEqual(false);
        //});

        it('other', function () {
            expect(bingo._splitEvName(['aaa'])).toEqual(['aaa']);
            expect(bingo._splitEvName(true)).toEqual(true);
            expect(bingo._splitEvName('')).toEqual(null);
            expect(bingo._splitEvName(' a  aaa  ')).toEqual(['a', 'aaa']);
            expect(bingo._splitEvName('aaa')).toEqual(['aaa']);
        });


    }); //end describe 常用方法

    describe('Event', function () {

        it('event on/one', function () {
            expect(({}).bgOn).toBeDefined();

            var count = 0, o = {};

            //on
            o.bgOn('test', function () { count++; });
            o.bgTrigger('test');
            o.bgTrigger('test');
            expect(count).toEqual(2);

            //one
            count = 0, o = {};
            o.bgOne('test', function () { count++; });
            o.bgTrigger('test');
            o.bgTrigger('test');
            expect(count).toEqual(1);

            //多个定义
            count = 0, o = {};
            o.bgOn('test test1', function () { count++; });
            o.bgTrigger('test');
            expect(count).toEqual(1);
            o.bgTrigger('test1');
            o.bgTrigger('test2');
            expect(count).toEqual(2);
            o.bgTrigger('test test1 test2');
            expect(count).toEqual(4);

        });

        it('event off', function () {

            var count = 0, o = {};
            //on
            o.bgOn('test', function (arg1, arg2) { count += (arg1 + arg2); });
            o.bgTrigger('test', [1, 2]);
            expect(count).toEqual(3);
            o.bgOff('test');
            o.bgTrigger('test', [3, 4]);
            expect(count).toEqual(3);

            count = 0;
            var count1 = 0;
            var ev1 = function () { count++; },
                ev2 = function () { count1++; };
            o.bgOn('test', ev1).bgOn('test', ev2);
            o.bgTrigger('test');
            expect(count).toEqual(1);
            expect(count1).toEqual(1);

            o.bgOff('test', ev1);
            o.bgTrigger('test');
            expect(count).toEqual(1);
            expect(count1).toEqual(2);

        });

        it('event args', function () {

            var count = 0, o = {};
            //on
            o.bgOn('test', function (arg1, arg2) { count += (arg1 + arg2); });
            o.bgTrigger('test', [1, 2]);
            expect(count).toEqual(3);

            o.bgTrigger('test', [3, 4]);
            expect(count).toEqual(10);

        });

        it('event end', function () {

            var count = 0, o = {};
            //on
            o.bgOn('test', function () { count++; });
            o.bgEnd('test');
            expect(count).toEqual(1);
            o.bgTrigger('test');
            expect(count).toEqual(1);
            o.bgOn('test', function () { count++; });
            expect(count).toEqual(2);
            o.bgTrigger('test');
            expect(count).toEqual(2);

        });

        it('event dispose', function () {

            var count = 0, o = { a: 1, b: 2 }, o1 = { aa: 11 };
            expect(o.bgIsDispose).toEqual(false);
            o.bgOnDispose(function () {
                count++;
            });
            o.bgDispose();
            expect(o.bgIsDispose).toEqual(true);
            expect(count).toEqual(1);
            expect(o.a).toEqual(null);
            expect(o.b).toEqual(null);

            expect(o1.aa).toEqual(11);
            expect(o1.bgIsDispose).toEqual(false);

            o = { a: 1, b: 2 }, o1 = { aa: 11 };
            o.bgDispose(o1);
            o.bgDispose();

            expect(o.a).toEqual(null);
            expect(o1.aa).toEqual(null);
            expect(o.bgIsDispose).toEqual(true);
            expect(o1.bgIsDispose).toEqual(true);


        });


    }); //end describe Event

    describe('Observe', function () {

        it('base', function () {
            //测试 delete 的 keys 存在否
            var o = { a: { b: 1, c: 2 } }.bgToObserve();
            expect(Object.keys(o.a).length).toEqual(2);
            delete o.a.b;
            expect(Object.keys(o.a).length).toEqual(1);

            var list = [2, 3];
            expect(Object.keys(list).length).toEqual(2);

            expect(list[0] == list['0']).toEqual(true);

            //测试属性生成， s = 'a[0].aa["bb\'s.df"b"].asdfas.ddd[0]'
            //bingo.observe时用
            var test = function (obj, s) {
                var dot = '=bingo_dot=';
                s =s.replace(/\[(["']?)(.*?)\1\][.]?/g, function (find, b, con) {
                    return ['.',con.replace('.', dot) ,'.'].join('');
                }).replace(/\.$/, '');
                var l = s.split('.'), nreg = /[^0-9]/,
                    end = l.length - 2, last = obj, name;
                bingo.each(l, function (item, index) {
                    item = item.replace(dot, '.');
                    if (index <= end) {
                        if (!last[item]) {
                            last = last[item] = (nreg.test(l[index + 1]) ? {} : []);
                        } else
                            last = last[item];
                    } else {
                        last[name = item] = null;
                    }
                });
                //console.log(name, last);
                return obj;
            };
            var obj = test({}, 'a[0].aa["bb\'s.df"b"].asdfas.ddd[0]');
            expect(obj).toEqual({ "a": [{ "aa": { "bb's.df\"b": { "asdfas": { "ddd": [null] } } } }] });

            var obj = test({}, 'a[0].aa["bb\'s.df"b"].asdfas.ddd.aaa');
            expect(obj).toEqual({ "a": [{ "aa": { "bb's.df\"b": { "asdfas": { "ddd": { aaa: null } } } } }] });

            //测试a已经存在
            obj = test({a:{}}, 'a[0].aa["bb\'s.df"b"].asdfas.ddd[0]');
            expect(obj).toEqual({ "a": { "0": { "aa": { "bb's.df\"b": { "asdfas": { "ddd": [null] } } } } } });

            //测试包涵 ]
            var obj = test({}, 'a0].aa["bb\'s.df"b"].asdfas.ddd.aaa]');
            expect(obj).toEqual({ "a0]": { "aa": { "bb's.df\"b": { "asdfas": { "ddd": { "aaa]": null } } } } } });

        });

        it('toObServe', function () {

            var o = { a: 1, b: { c: 3 }, 'test.aaa':111 };

            expect(bingo.isObserve(o)).toEqual(false);
            expect(bingo.isObserve(o, 'a')).toEqual(false);
            expect(bingo.isObserve(o, 'test.aaa')).toEqual(false);

            o.bgToObserve();

            expect(bingo.isObserve(o)).toEqual(true);
            expect(bingo.isObserve(o, 'a')).toEqual(true);
            expect(bingo.isObserve(o, 'b')).toEqual(true);
            expect(bingo.isObserve(o, 'test.aaa')).toEqual(true);
            expect(bingo.isObserve(o.b, 'c')).toEqual(true);
            expect(!!o._bg_obdata_.obs.b).toEqual(true);

            //不存在c属性
            expect(bingo.isObserve(o, 'c')).toEqual(false);
            expect(!!o._bg_obdata_.obs.c).toEqual(false);

            //a添加object对象自动toObserve
            o.a = { aa: 1 };
            expect(bingo.isObserve(o.a, 'aa')).toEqual(true);

            //window, 不能整个toObserve, 只能添加属性
            window.aaa = 1;
            window.bgToObserve('aaa');
            expect(bingo.isObserve(window, 'aaa')).toEqual(true);
        }); // end toObServe

        it('observe', function () {

            var o = { a: 1, b: 2, 'test.a':3 }, count = 0;

            o.bgObServe('a', function (changes) {
                var c = changes[0];
                var value = c.value;
                expect(c.name == 'a').toEqual(true);
                expect(value == 2).toEqual(true);
                //console.log(arguments);
                expect(value != c.oldValue).toEqual(true);
                expect(c.object == this).toEqual(true);
                this.b = value * 2;
                count++;
            });
            o.a = 2;
            o.a = 2;
            expect(o.a).toEqual(2);
            expect(o.b).toEqual(2 * 2);
            expect(count).toEqual(1);

            count = 0;
            o.bgObServe('b', function (changes) {
                count++;
            });
            o.b = 100;
            with (o) { b = 200; }
            expect(o.a).toEqual(2);
            expect(o.b).toEqual(200);
            expect(count).toEqual(2);

            count = 0;
            o.bgObServe('test.a', function (changes) {
                var c = changes[0];
                expect(c.value).toEqual(11);
                expect(c.oldValue).toEqual(3);
                count++;
            });
            o['test.a'] = 11;
            expect(count).toEqual(1);

            //测试遍历属性情况
            expect(Object.keys(o)).toEqual(['a', 'b', 'test.a']);

        }); //edn observe

        //it('observe add or del', function () {

        //    var test = { o: { a: 1, b: 2 } }.bgToObserve();
        //    var waitCount = 0, len = 0;;
        //    test.o.bgObServe(function (c) {
        //        waitCount = 1;
        //        len = c.length;
        //    });
        //    test.o.c = 3;
        //    delete test.o.a;

        //    waitsFor(function () { return waitCount == 1; }, null, 1000);

        //    runs(function () {
        //        expect(len).toEqual(2);
        //    });

        //});

        it('unObserve', function () {

            var o = { a: 1, b: 2, 'test.a': 3 }, count = 0;

            var count = 0;
            var oF = function (changes) {
                count++;
            };
            o.bgObServe('a', oF);
            o.a = 2;
            expect(o.a).toEqual(2);
            o.bgUnObServe('a', oF);
            o.a = 3;
            expect(o.a).toEqual(3);
            expect(count).toEqual(1);

            o.bgObServe('a', oF);
            o.a = 4;
            expect(count).toEqual(2);
            o.bgUnObServe('a');
            o.a = 5;
            expect(count).toEqual(2);
        }); //edn unObserve

        it('observe list', function () {

            var waitCount = 0;
            var test = { list: [1, 2] }.bgToObserve();

            var plCount = 0, lCount = 0;
            test.bgObServe('list', function (changes) {
                var c = changes[0];
                plCount++;
                expect(c.name == 'list').toEqual(true);
                expect(c.value == test.list).toEqual(true);
                expect(c.value != c.oldValue).toEqual(true);
                expect(c.object == test).toEqual(true);
            });
            test.list.bgObServe(function (changes) {
                var c = changes[0];
                lCount++; waitCount++;
                expect(c.name == '0').toEqual(true);
                expect(c.value == 2).toEqual(true);
                expect(c.oldValue == 1).toEqual(true);
                //c.object等于旧对象(test.list)
                expect(c.object == this).toEqual(true);
                expect(c.object != test.list).toEqual(true);
            });
            //safari pc 5.1.1 不能观察数组下标元素
            test.list[0] = 2;
            test.list = [3, 4];

            waitsFor(function () { return waitCount == 1; }, null, 1000);

            runs(function () {
                expect(plCount).toEqual(1);
                expect(lCount).toEqual(1);
            });

            //这情况暂时不支持
            //var test1 = { list: [1, 2] }.bgToObserve();

            //var plCount1 = 0, lCount1 = 0, waitCount1 = 0;
            //test1.list.bgObServe('0', function (changes) {
            //    plCount1++;
            //});

            //test1.list.bgObServe('push', function (changes) {
            //    plCount1++;
            //});

            //test1.list.bgObServe(function (changes) {
            //    lCount1++; waitCount1++;
            //});
            //test1.list[0] = 2;
            //test1.list[1] = 4;
            //test1.list.push(5);

            //waitsFor(function () { return waitCount1 == 1; }, null, 1000);

            //runs(function () {
            //    expect(plCount1).toEqual(2);
            //    expect(lCount1).toEqual(1);
            //});

        }); //edn observe list

        it('observe object', function () {

            var waitCount = 0;
            var test = { obj: { a: 1, b: 2 } }.bgToObserve();

            var plCount = 0, lCount = 0;
            test.bgObServe('obj', function (changes) {
                var c = changes[0];
                plCount++;
                expect(c.name == 'obj').toEqual(true);
                expect(c.value == test.obj).toEqual(true);
                expect(c.value != c.oldValue).toEqual(true);
                expect(c.object == test).toEqual(true);
            });
            test.obj.bgObServe(function (changes) {
                var c = changes[0];
                lCount++; waitCount++;
                expect(c.name == 'a').toEqual(true);
                expect(c.value == 2).toEqual(true);
                expect(c.oldValue == 1).toEqual(true);
                //c.object等于旧对象(test.list)
                expect(c.object == this).toEqual(true);
                expect(c.object != test.list).toEqual(true);
            });
            test.obj.a = 2;
            test.obj = { a: 3, b: 4 };

            waitsFor(function () { return waitCount == 1; }, null, 1000);

            runs(function () {
                expect(plCount).toEqual(1);
                expect(lCount).toEqual(1);
            });

            var test1 = { obj: { a: 1, b: 2, c: 3 } }.bgToObserve();

            var plCount1 = 0, lCount1 = 0, waitCount1 = 0;
            test1.obj.bgObServe('a', function (changes) {
                plCount1++;
            });

            test1.obj.bgObServe(function (changes) {
                lCount1++; waitCount1++;
            });
            test1.obj.a = 2;
            test1.obj.b = 4;
            test1.obj.c = 5;

            waitsFor(function () { return waitCount1 == 1; }, null, 1000);

            runs(function () {
                expect(plCount1).toEqual(1);
                expect(lCount1).toEqual(1);
            });

        }); //end observe object


        it('bingo.observe object', function () {

            var waitCount = 0;
            var test = { obj: { a: 1, b: 2 } }.bgToObserve();

            var plCount = 0, lCount = 0;
            bingo.observe(test, 'obj', function (c) {
                plCount++; waitCount++;
                expect(c.name == 'obj').toEqual(true);
                expect(c.value == test.obj).toEqual(true);
                expect(c.value != c.oldValue).toEqual(true);
                expect(c.object == test).toEqual(true);
            });
            //暂时支持这种情况
            //bingo.observe(test.obj, function (c) {
            //    lCount++; waitCount++;
            //    expect(c.name == 'a').toEqual(true);
            //    expect(c.value == 2).toEqual(true);
            //    expect(c.oldValue == 1).toEqual(true);
            //    //c.object等于旧对象(test.list)
            //    expect(c.object == this).toEqual(true);
            //    expect(c.object != test.list).toEqual(true);
            //});
            test.obj.a = 2;
            test.obj = { a: 3, b: 4 };

            waitsFor(function () { return waitCount == 1; }, null, 1000);

            runs(function () {
                expect(plCount).toEqual(1);
                //expect(lCount).toEqual(1);
            });

        }); //end bingo.observe object

        it('bingo.observe fn', function () {

            var waitCount = 0;
            var test = { obj: { a: 1, b: 2 } }.bgToObserve();

            bingo.observe(function () {
                return test.obj.a + test.obj.b;
            }, function (c) {
                expect(c.value).toEqual(7);
                expect(c.oldValue).toEqual(3);
                waitCount++;
            });
            test.obj.a = 3;
            test.obj.b = 4;


            waitsFor(function () { return waitCount == 1; }, null, 1000);

            runs(function () {
                expect(test.obj.b + test.obj.a).toEqual(7);
            });

        }); //end bingo.observe fn

        it('bingo.observe fn publish', function () {

            var waitCount = 0;
            var test = { obj: { a: 1, b: 2 } }.bgToObserve();

            var obs = bingo.observe(function () {
                return test.obj.a + test.obj.b;
            }, function (c) {
                expect(c.value).toEqual(3);
                expect(c.oldValue).toEqual(3);
                waitCount++;
            });


            waitsFor(function () { return waitCount == 1; }, null, 1000);

            runs(function () {
                expect(test.obj.b + test.obj.a).toEqual(3);
            });
            obs.publish();

        }); //end bingo.observe fn

        it('bingo.observe fn change collect', function () {

            var waitCount = 0;
            var test = { obj: { a: 1, b: 2 } }.bgToObserve();

            var obs = bingo.observe(function () {
                return test.obj.a + test.obj.b;
            }, function (c) {
                expect(c.value).toEqual(8);
                expect(c.oldValue).toEqual(3);
                waitCount++;
            });
            expect(obs.value).toEqual(3);
            //修改obj 也能观察到
            test.obj = { a: 3, b: 4 };
            //再修改obj.b
            test.obj.b = 5;

            waitsFor(function () { return waitCount == 1; }, null, 1000);

            runs(function () {
                expect(test.obj.b + test.obj.a).toEqual(8);
            });

        }); //end bingo.observe fn change parent



        it('bingo.observe obj attr', function () {

            var waitCount = 0;
            var test = { obj: { a: 1, b: 2 } }.bgToObserve();

           var obs = bingo.observe(test, 'obj.a', function (c) {
                expect(c.value).toEqual(5);
                expect(c.oldValue).toEqual(1);
                waitCount++;
           });
           expect(obs.value).toEqual(1);
            test.obj.a = 5;

            waitsFor(function () { return waitCount == 1; }, null, 1000);

            runs(function () {
                expect(test.obj.b + test.obj.a).toEqual(7);
            });

        }); //end bingo.observe obj attr


        it('bingo.observe obj attr publish', function () {

            var waitCount = 0;
            var test = { obj: { a: 1, b: 2 } }.bgToObserve();

            var obs = bingo.observe(test, 'obj.a', function (c) {
                expect(c.value).toEqual(1);
                expect(c.oldValue).toEqual(1);
                waitCount++;
            });

            waitsFor(function () { return waitCount == 1; }, null, 1000);

            runs(function () {
                expect(test.obj.a).toEqual(1);
            });

            obs.publish();

        }); //end bingo.observe obj attr

        it('bingo.observe unObserve', function () {

            var test = { obj: { a: 1, b: 2 } }.bgToObserve();

            var ob = bingo.observe(test, 'obj.a', function (c) {
                //如果没有unObserve 会报错
                expect(true).toEqual(false);
                console.log('bo[0]');
            });
           ob.unObserve();
           test.obj.a = 5;

            //测试bingo.observe unObserve
           var count = 0, waitCount = 0;
           ob = bingo.observe(function () {
               return test.obj.a + test.obj.b;
           }, function (c) {
               count++;
           });
           ob.unObserve();
           test.obj.a = 10;

           setTimeout(function () {
               waitCount++;
           }, 100);

           waitsFor(function () { return waitCount == 1; }, null, 1000);

           runs(function () {
               expect(count).toEqual(0);
           });


        }); //end bingo.observe obj attr

    }); //end describe Observe

    describe('using', function () {

        it('using', function () {

            bingo.using('spec/using/a.js').then(function () {
                bingo.using('spec/using/aAfter.js');
            });
            bingo.using('spec/using/b.js');

            var waitOk = false;
            bingo.usingAll().then(function () {
                waitOk = true;
            });
            waitsFor(function () { return waitOk; });

            runs(function () {
                expect(usingA__).toEqual('a');
                expect(usingB__).toEqual('b');
                expect(usingAfter__).toEqual('after' + usingA__);
            });

        }); //end using

        //it('usingMap', function () {


        //    bingo.usingMap('test/aaaa.js', ['as/**', 'bs/*.js', 'bbb/aaa.js', 'qu/aaa?.js']);
        //    var _map = bingo.usingMap.map;

        //    expect(_map('test/aaaa.js')).toEqual('test/aaaa.js');
        //    expect(_map('as/aaaa.js')).toEqual('test/aaaa.js');
        //    expect(_map('bs/aaa.js')).toEqual('test/aaaa.js');
        //    expect(_map('bbb/aaa.js')).toEqual('test/aaaa.js');
        //    expect(_map('qu/aaaB.js')).toEqual('test/aaaa.js');

        //    expect(_map('bbb/aaa.js?sdf=as')).toEqual('test/aaaa.js');

        //    expect(_map('bbbb/asf/aaa.js')).not.toEqual('test/aaaa.js');
        //    expect(_map('bbbb/aaa.js')).not.toEqual('test/aaaa.js');

        //});//end usingMap

    }); // end describe using

    describe('linkNode', function () {

        it('base', function () {
            var node = $.parseHTML('<div><span></span><div><a></a></div>text</div>')[0];
            document.body.appendChild(node);
            var all = node.querySelectorAll('*');
            var count = all.length;
            expect(count).toEqual(3);

            var textNode = node.lastChild;
            expect(textNode.nodeType).toEqual(3);
            textNode.testprop = 222;
            expect(textNode.testprop === 222).toEqual(true);

            expect(bingo.isNull(textNode.parentNode)).toEqual(false);
            node.removeChild(node.lastChild);
            expect(bingo.isNull(textNode.parentNode)).toEqual(true);

            //测试冒泡
            var tick = 0;
            node.addEventListener('DOMNodeRemoved', function () {
                tick++;
            });
            node.firstChild.addEventListener('DOMNodeRemoved', function () {
                tick++;
            });
            node.removeChild(node.firstChild);
            expect(tick).toEqual(2);
            document.body.removeChild(node);


            node = $.parseHTML('<div><span></span><div><a></a></div></div>')[0];
            document.body.appendChild(node);
            tick = 0;
            node.addEventListener('DOMNodeRemoved', function () {
                tick++;
            });
            node.firstChild.addEventListener('DOMNodeRemoved', function (e) {
                e.stopPropagation();
                tick++;
            });
            node.removeChild(node.firstChild);
            expect(tick).toEqual(1);
            document.body.removeChild(node);

            //$(document.documentElement).bind('DOMNodeRemoved', function (e) {
            //    e.target == node.firstChild &&  console.log('DOMNodeRemoved documentElement');
            //});
            //$(node.firstChild).remove();
            ////console.log('aaa');
            //node.removeChild(node.firstChild);
        }); // end base

        it('link', function () {
            var node = $.parseHTML('<div><span>ddd</span><div><a>aaa</a></div></div>')[0];
            var div = node.firstChild.nextSibling;
            //IE必须先添加到document才生效
            document.body.appendChild(node);

            var count = 0;
            bingo.linkNode(div, function () {
                expect(div === this).toEqual(true);
                count++;
            });
            bingo.linkNode(div.firstChild, function () {
                expect(div.firstChild === this).toEqual(true);
                count++;
            });

            node.removeChild(div);

            waitsFor(function () { return count == 2; }, 1000);

            runs(function () {
                expect(count).toEqual(2);
            });
            document.body.removeChild(node);

        }); // end link

        it('unLink', function () {
            var node = $.parseHTML('<div><span>ddd</span><div><a>aaa</a></div></div>')[0];
            var span = node.firstChild;
            document.body.appendChild(node);

            var count = 0, wait = false;
            bingo.linkNode(span, function () {
                count++;
            });

            bingo.unLinkNode(span);

            node.removeChild(span);
            setTimeout(function () { wait = true; }, 50);

            waitsFor(function () { return wait; }, 1000);

            runs(function () {
                expect(count).toEqual(0);
            });
            document.body.removeChild(node);

        }); // end unLink

        it('unLink fn', function () {
            var node = $.parseHTML('<div><span>ddd</span><div><a>aaa</a></div></div>')[0];
            var span = node.firstChild;
            document.body.appendChild(node);

            var count = 0, wait = false,
                fn = function () {
                    count++;
                };
            bingo.linkNode(span, fn);
            bingo.linkNode(span, function () {
                count++;
            });

            bingo.unLinkNode(span, fn);

            node.removeChild(span);
            setTimeout(function () { wait = true; }, 50);

            waitsFor(function () { return wait; }, 1000);

            runs(function () {
                expect(count).toEqual(1);
            });
            document.body.removeChild(node);

        }); // end unLink fn


        it('link object', function () {
            var node = $.parseHTML('<div><span>ddd</span><div><a>aaa</a></div></div>')[0];
            var div = node.firstChild.nextSibling;
            //IE必须先添加到document才生效
            document.body.appendChild(node);

            var count = 0, o = { a: 1 };
            o.bgLinkNode(div);
            o.bgOnDispose(function () {
                count++;
            });

            node.removeChild(div);

            waitsFor(function () { return count == 1; }, 1000);

            runs(function () {
                expect(count).toEqual(1);
            });
            document.body.removeChild(node);

        }); // end link object

        it('unlink object', function () {
            var node = $.parseHTML('<div><span>ddd</span><div><a>aaa</a></div></div>')[0];
            var div = node.firstChild.nextSibling;

            var count = 0, o = { a: 1 };
            o.bgLinkNode(div);
            o.bgLinkNode(div);
            o.bgOnDispose(function () {
                count++;
            });
            o.bgUnLinkNode(div);

            node.removeChild(div);
            setTimeout(function () { count++ }, 10);
            waitsFor(function () { return count == 1; }, 1000);

            runs(function () {
                expect(count).toEqual(1);
            });

        }); // end unlink object

        it('link All object', function () {
            var node = $.parseHTML('<div><span>ddd</span><div><a>aaa</a></div></div>')[0];
            var div = node.firstChild.nextSibling;
            //IE必须先添加到document才生效
            document.body.appendChild(node);

            var count = 0, o = { a: 1 };
            o.bgLinkNodeAll(function () {
                count++;
            });

            node.removeChild(div);

            waitsFor(function () { return count >= 1; }, 1000);

            runs(function () {
                expect(count >= 1).toEqual(true);
            });
            document.body.removeChild(node);

        }); // end link All object

        it('unLink All object', function () {
            var node = $.parseHTML('<div><span>ddd</span><div><a>aaa</a></div></div>')[0];
            var div = node.firstChild.nextSibling;
            //IE必须先添加到document才生效
            document.body.appendChild(node);

            var count = 0, o = { a: 1 };
            var fn = function () {
                expect(1).toEqual(2);
                count++;
            };
            o.bgLinkNodeAll(fn);
            o.bgUnLinkNodeAll(fn);

            node.removeChild(div);

            setTimeout(function () { count++ }, 100);
            waitsFor(function () { return count == 1; }, 1000);

            runs(function () {
                expect(count).toEqual(1);
            });
            document.body.removeChild(node);

        }); // end unLink All object



    }); //end describe linkNode

    describe('bingo.route ======>', function () {

        it('bingo.route', function () {

            //定义route
            bingo.route('my', {
                url: 'my/{module}/{action}/{id}',
                to: 'spec/route/{module}_{action}.js',
                defaultValue: { module: 'sys', action: 'user', id: '' }
            });

            bingo.route('myTest', {
                //支持*
                url: 'myTest*/{module}/{action}/{id}',
                to: 'spec/route/{module}_{action}_test.js',
                defaultValue: { module: 'sys', action: 'user', id: '' }
            });

            var routeUrl = 'my/sys/user/1';

            //module, controller, action为框架所需参数, 其它参数会生成query, 如id=1
            expect(bingo.route(routeUrl).using).toEqual('spec/route/sys_user.js?id=1');

            //bingo.routeContext, 解释成具体内容
            //var rCtext = bingo.routeContext(routeUrl);
            //expect(rCtext).toEqual({
            //    name: 'my', params: { module: 'sys', action: 'user', id: '1', queryParams: {} },
            //    url: 'my/sys/user/1', to: 'spec/route/sys_user.js?id=1',
            //    actionContext: rCtext.actionContext
            //});

            //bingo.routeLink, 生成route url
            expect(bingo.routeLink('my', { module: 'sys', action: 'user', id: '1' })).toEqual(routeUrl);

            //以下测试using一个route url
            window.testusingRoute = 0;
            var isOk = false;
            bingo.using(routeUrl).then(function () {
                isOk = true;
            });
            waitsFor(function () { return isOk; }, 5000);
            runs(function () {
                expect(testusingRoute).toEqual(1);
            });

            //测试myTest
            expect(bingo.route('myTest/sys/user/1').using).toEqual('spec/route/sys_user_test.js?id=1');
            expect(bingo.route('myTest111/sys/user/1').using).toEqual('spec/route/sys_user_test.js?id=1');


            bingo.route('view', {
                //路由url, 如: view/system/user/list
                //priority: 200,
                url: 'view/{module}/{contorller*}',
                //路由到目标url, 生成:modules/system/views/user/list.html
                to: 'modules/{module}/{contorller*}.html'
            });

            var context1 = bingo.routeContext('view/demo/user/list$aa:1?bb=22&c=333');
            expect(context1.params.aa).toEqual('1');
            expect(context1.params.bb).toEqual('22');
            expect(context1.params.c).toEqual('333');


            bingo.route('test_all', {
                //路由url, 如: view/system/user/list
                priority: 90,
                url: 'view/{app}/{controller*}_{md5}',
                //路由到目标url, 生成:modules/system/views/user/list.html
                to: 'modules/{app}/{controller*}_{md5}.html'
            });

            var tContext = bingo.routeContext('view/command/renderSync/ddddd/test_aasdf$id:11111');
            expect(tContext.params.app).toEqual('command');
            expect(tContext.params.controller).toEqual('renderSync/ddddd/test');
            expect(tContext.params.md5).toEqual('aasdf');
            expect(tContext.params.id).toEqual('11111');
            expect(tContext.params.queryParams.id).toEqual('11111');
            expect(tContext.params.queryParams.md5).toEqual(undefined);

        });

    });//end bingo.route

    describe('cache', function () {

        it('base', function () {
            var obj = {};
            bingo.cache(obj, 'key', 1);
            expect(bingo.cache(obj, 'key')).toEqual(1);

            bingo.cacheRemove(obj, 'key');
            expect(bingo.isUndefined(bingo.cache(obj, 'key'))).toEqual(true);

        });//end base

        it('max', function () {
            var obj = {};

            //最大2
            bingo.cache(obj, 'key1', 1, 2);
            
            var wOk = false;
            setTimeout(function () {
                for (var i = 0; i < 6; i++)
                    bingo.cache(obj, bingo.makeAutoId(), 1);
                expect(bingo.cache(obj, 'key1')).toEqual(1);
                setTimeout(function () {
                    wOk = true;
                }, 50);
            });
            waitsFor(function () { return wOk; });
            
            runs(function () {
                //最大2
                bingo.cache(obj, 'key2', 1, 2);
                bingo.cache(obj, 'key3', 1, 2);
                expect(bingo.cache(obj, 'key2')).toEqual(1);
                //console.log(bingo.cache(obj, 'key2'), bingo.cache(obj, 'key1'));
                expect(bingo.isUndefined(bingo.cache(obj, 'key1'))).toEqual(true);
            });

        });//end max

    }); //end describe compiles

    describe('Promise', function () {

        it('base', function () {

            var p = bingo.Promise(function (r, e) {
                setTimeout(function () { r('success'); }, 0);
                //r(bingo.Promise.reject('error'));
                //e('error');
            });
            expect(p instanceof bingo.Promise).toEqual(true);

            var waitCount = 0;
            bingo.Promise(function (r, e) {
                r('ok');
            }).then(function (r) {
                expect(r).toEqual('ok');
                waitCount++;
            });

            bingo.Promise(function (r, e) {
                r(bingo.Promise.resolve('ok'));
            }).then(function (r) {
                expect(r).toEqual('ok');
                waitCount++;
            });

            bingo.Promise(function (r, e) {
                setTimeout(function () { r('ok'); }, 0);
            }).then(function (r) {
                expect(r).toEqual('ok');
                waitCount++;
            });

            bingo.Promise(function (r, e) {
                e('error');
            }).then(null, function (r) {
                expect(r).toEqual('error');
                waitCount++;
            });

            bingo.Promise(function (r, e) {
                r(bingo.Promise.reject('error'));
            }).then(null, function (r) {
                expect(r).toEqual('error');
                waitCount++;
            });

            bingo.Promise(function (r, e) {
                setTimeout(function () { e('error'); }, 0);
            }).then(null, function (r) {
                expect(r).toEqual('error');
                waitCount++;
            });

            waitsFor(function () { return waitCount == 6; }, 500);
            
            runs(function () {
                expect(waitCount).toEqual(6);
            });

        });//end base

        it('resolve', function () {

            var waitCount = 0;
            bingo.Promise(function (r, e) {
                setTimeout(function () {
                    r('ok');
                }, 0);
            }).then(function (r) {
                waitCount++
                expect(r).toEqual('ok');
                return 'ok1';
            }).then(function (r) {
                waitCount++
                expect(r).toEqual('ok1');
                return bingo.Promise.resolve('resolve');
            }).then(function (r) {
                return bingo.Promise(function (r) {
                    setTimeout(function () {
                        waitCount++
                        r('t ok');
                    }, 10);
                });
            }).then(function (r) {
                expect(waitCount).toEqual(3);
                expect(r).toEqual('t ok');
                waitCount++
            });

            waitsFor(function () { return waitCount == 4; }, 50);

            runs(function () {
                expect(waitCount).toEqual(4);
            });

        });//end resolve

        it('resolve1', function () {

            var waitCount = 0;
            bingo.Promise(function (r, e) {
                r('ok');
            }).then(function (r) {
                return bingo.Promise(function (r) {
                    setTimeout(function () {
                        waitCount++
                        r('t ok');
                    }, 10);
                });
            }).then(function (r) {
                expect(waitCount).toEqual(1);
                expect(r).toEqual('t ok');
                waitCount++
            });

            waitsFor(function () { return waitCount == 2; }, 50);

            runs(function () {
                expect(waitCount).toEqual(2);
            });

        });//end resolve1

        it('reject', function () {

            var waitCount = 0;
            bingo.Promise(function (r, e) {
                setTimeout(function () {
                    e('error');
                }, 0);
            }).then(function (r) {
                //这里不会到来
                expect(r).toEqual('reject');
                waitCount++
            }).then(null, function (r) {
                waitCount++
                expect(r).toEqual('error');
                return bingo.Promise.reject('reject');
            }).then(null, function (r) {
                //这里不会到来
                waitCount++
                expect(r).toEqual('error');
                return bingo.Promise.reject('reject');
            }).catch(function (r) {
                //这里不会到来
                waitCount++
                expect(r).toEqual('error');
                return bingo.Promise.reject('reject');
            });

            waitsFor(function () { return waitCount == 1; }, 10);

            runs(function () {
                expect(waitCount).toEqual(1);
            });

        });//end reject

        it('catch', function () {

            var waitCount = 0;
            bingo.Promise(function (r, e) {
                setTimeout(function () {
                    e('error');
                }, 0);
            }).catch(function (r) {
                expect(r).toEqual('error');
                waitCount++
            });

            waitsFor(function () { return waitCount == 1; }, 10);

            runs(function () {
                expect(waitCount).toEqual(1);
            });

        });//end catch

        it('catch 2', function () {

            var waitCount = 0;
            bingo.Promise(function (r, e) {
                    asdf.aa = 1;
            }).catch(function (r) {
                expect(r instanceof Error).toEqual(true);
                waitCount++
            });

            //等效catch
            bingo.Promise(function (r, e) {
                asdf.aa = 1;
            }).then(null, function (r) {
                expect(r instanceof Error).toEqual(true);
                waitCount++
            });

            //等效catch
            bingo.Promise(function (r, e) {
                r(bingo.Promise.reject('error'));
            }).then(null, function (r) {
                expect(r).toEqual('error');
                waitCount++
            });

            waitsFor(function () { return waitCount == 3; }, 10);

            runs(function () {
                expect(waitCount).toEqual(3);
            });

        });//end catch 2

        it('finally', function () {

            var waitCount = 0;
            bingo.Promise(function (r, e) {
                setTimeout(function () {
                    e('error');
                }, 0);
            }).finally(function (r) {
                expect(r).toEqual('error');
                waitCount++
            });

            bingo.Promise(function (r, e) {
                setTimeout(function () {
                    r('ok');
                }, 0);
            }).finally(function (r) {
                expect(r).toEqual('ok');
                waitCount++
            });

            waitsFor(function () { return waitCount == 2; }, 10);

            runs(function () {
                expect(waitCount).toEqual(2);
            });

        });//end finally

        it('finally 2', function () {

            var waitCount = 0;
            bingo.Promise(function (r, e) {
                asdf.aa = 1;
            }).finally(function (r) {
                expect(r instanceof Error).toEqual(true);
                waitCount++
            });

            waitsFor(function () { return waitCount == 1; }, 10);

            runs(function () {
                expect(waitCount).toEqual(1);
            });

        });//end finally 2

        it('finally 3', function () {

            var waitCount = 0;
            bingo.Promise(function (r, e) {
                setTimeout(function () {
                    r('ok');
                }, 0);
            }).then(function (r) {
                waitCount++
                expect(r).toEqual('ok');
                return 'ok1';
            }).then(function (r) {
                waitCount++
                expect(r).toEqual('ok1');
                return bingo.Promise.resolve('resolve');
            }).finally(function (r) {
                expect(r).toEqual('resolve');
                waitCount++
            });

            waitsFor(function () { return waitCount == 3; }, 10);

            runs(function () {
                expect(waitCount).toEqual(3);
            });

        });//end finally 3

        it('when/all', function () {

            var waitCount = 0;
            //全部通过
            bingo.Promise.when([
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        waitCount++;
                        r('ok');
                    }, 0);
                }),
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        waitCount++;
                        r('ok1');
                    }, 0);
                })
            ]).then(function (r) {
                waitCount++;
                expect(waitCount).toEqual(3);
                expect(r).toEqual(['ok', 'ok1']);
            });

            waitsFor(function () { return waitCount == 3; }, 10);

            runs(function () {
                expect(waitCount).toEqual(3);
            });

        });//end when/all

        it('when/all 2', function () {

            var waitCount = 0;

            //一个不通过
            bingo.Promise.when([
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        r('ok');
                    }, 0);
                }),
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        e('error');
                    }, 0);
                })
            ]).then(null, function (r) {
                waitCount++;
                expect(r).toEqual('error');
            });

            waitsFor(function () { return waitCount == 1; }, 10);

            runs(function () {
                expect(waitCount).toEqual(1);
            });

        });//end when/all 2

        it('when/all 3', function () {

            var waitCount = 0;

            //一个不通过
            bingo.Promise.all([
                'o1',
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        r('ok');
                    }, 0);
                }), 'ok1'
            ]).then(function (r) {
                waitCount++;
                expect(r).toEqual(['o1', 'ok', 'ok1']);
            });

            waitsFor(function () { return waitCount == 1; }, 10);

            runs(function () {
                expect(waitCount).toEqual(1);
            });

        });//end when/all 3

        it('when/all 3', function () {

            var waitCount = 0;

            //一个不通过
            bingo.Promise.all(['o1', 'ok1'], function (a) {
                return bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        r(a);
                    }, 0);
                })
            }).then(function (r) {
                waitCount++;
                expect(r).toEqual(['o1', 'ok1']);
            });

            waitsFor(function () { return waitCount == 1; }, 10);

            runs(function () {
                expect(waitCount).toEqual(1);
            });

        });//end when/all 4

        it('always', function () {

            var waitCount = 0;

            //一个不通过
            bingo.Promise.always([
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        waitCount++;
                        e('error1');
                    }, 0);
                }),
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        waitCount++;
                        r('ok');
                    }, 0);
                }),
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        waitCount++;
                        e('error');
                    }, 0);
                })
            ]).then(function (r) {
                waitCount++;
                expect(waitCount == 4).toEqual(true);
                expect(bingo.inArray('ok', r) >= 0).toEqual(true);
                expect(bingo.inArray('error', r) >= 0).toEqual(true);
                expect(bingo.inArray('error1', r) >= 0).toEqual(true);
            });

            waitsFor(function () { return waitCount == 4; }, 10);

            runs(function () {
                expect(waitCount).toEqual(4);
            });

        });//end when/all 4

        it('race', function () {

            var waitCount = 0;

            //一个通过
            bingo.Promise.race([
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        waitCount++;
                        r('ok');
                    }, 0);
                }),
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        waitCount++;
                        r('ok1');
                    }, 0);
                })
            ]).then(function (r) {
                waitCount++;
                expect(waitCount < 3).toEqual(true);
                expect(bingo.inArray(r, ['ok', 'ok1'])>=0).toEqual(true);
            });

            waitsFor(function () { return waitCount == 3; }, 10);

            runs(function () {
                expect(waitCount).toEqual(3);
            });

        });//end race

        it('race 2', function () {

            var waitCount = 0;

            //一个不通过
            bingo.Promise.race([
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        waitCount++;
                        r('ok');
                    }, 0);
                }),
                bingo.Promise(function (r, e) {
                    setTimeout(function () {
                        waitCount++;
                        e('error');
                    }, 0);
                })
            ]).then(function (r) {
                waitCount++;
                expect(waitCount < 3).toEqual(true);
                expect(r).toEqual('ok');
            }, function (r) {
                waitCount++;
                expect(waitCount < 3).toEqual(true);
                expect(r).toEqual('error');
            });

            waitsFor(function () { return waitCount == 3; }, 10);

            runs(function () {
                expect(waitCount).toEqual(3);
            });

        });//end race 2

    }); //end describe compiles


    describe('compiles', function () {

        it('base', function () {
            var node = $.parseHTML('<div><input value="a" /><span>ddd</span><div><a>aaa</a></div></div>')[0];

            expect(bingo.isNullEmpty(node.outerHTML)).toEqual(false);
            expect(bingo.isNullEmpty(node.innerHTML)).toEqual(false);

            //console.log(node.firstChild.attributes[0]);
            node.firstChild.attributes[0].aaa = 1;
            expect(node.firstChild.attributes[0].aaa).toEqual(1);

        });//end base

    }); //end describe compiles

});

////测试Object.keys时间
////对象随机100个属性
////测试20迭代10000次Object.keys, 平均每10000次为120ms左右时间
////满足用于业务的运算需求
//var obj = {};
//for (var i = 0; i < 100; i++) {
//    obj[bingo.makeAutoId()] = 1;
//}
//var keys;
//console.time('tttt');
//for (var n = 0; n < 20; n++) {
//    for (var j = 0; j < 10000; j++) {
//        keys = Object.keys(obj);
//    }
//}
//console.timeEnd('tttt');
//console.log(keys);

//console.log(Object.keys(test.o));



//var filter = {
//    acceptNode: function (node) {
//        return node.tagName.toLowerCase() != "div" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
//    }
//};

//var iterator = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, filter.acceptNode, false);
//var node;
//while (node = iterator.nextNode()) {
//    console.log(node.tagName);
//    //node = iterator.nextNode();
//}
//undefined
//var filter = {
//    acceptNode: function (node) {
//        return node.tagName.toLowerCase() == "div" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
//    }
//};

//var iterator = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, filter.acceptNode, false);
//var node;
//while (node = iterator.nextNode()) {
//    console.log(node.tagName);
//    //node = iterator.nextNode();
//}