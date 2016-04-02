/// <reference path="../src/helper.js" />


//var node = $.parseHTML('<div><span>ddd</span><div><a>aaa</a></div></div>')[0];
//var div = node.firstChild.nextSibling;
//$(div).bind('DOMNodeRemoved', function () { console.log('aaa'); });
//document.body.appendChild(node);
//div.parentNode.removeChild(div)
describe('Observe --- ', function () {

    var undefined;

    it('defineProperties exist', function () {

        expect(Object.defineProperties).toBeDefined();

        expect(Object.defineProperty).toBeDefined();

    });

    var n = 1, n1 = new Number(1),
        s = '', s1 = new String(''),
        na = NaN, IN = Infinity,
        list = [], list1 = new Array(),
        fn = function () { }, fn1 = new Function(''),
        o = {}, o1 = new fn(),
        date = new Date(),
        regx = /a/, regx1 = new RegExp('a'),
        element = document.documentElement,
        win = window, doc = window.document;

    describe('defineProperties', function () {


        it('Object.prototype 影响范围', function () {
            //开始测试defineProperties 影响
            Object.defineProperties(Object.prototype, {
                "testDefine": {
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

            expect(n.testDefine === true).toEqual(true);
            expect(n1.testDefine === true).toEqual(true);
            expect(s.testDefine === true).toEqual(true);
            expect(s1.testDefine === true).toEqual(true);
            expect(na.testDefine === true).toEqual(true);
            expect(IN.testDefine === true).toEqual(true);
            expect(list.testDefine === true).toEqual(true);
            expect(list1.testDefine === true).toEqual(true);
            expect(o.testDefine === true).toEqual(true);
            expect(o1.testDefine === true).toEqual(true);
            expect(date.testDefine === true).toEqual(true);
            expect(regx.testDefine === true).toEqual(true);
            expect(regx1.testDefine === true).toEqual(true);

            expect(element.testDefine === true).toEqual(true);
            expect(win.testDefine === true).toEqual(true);
            expect(doc.testDefine === true).toEqual(true);

        }); //end Object.prototype defineProperties

        it('Object.prototype this 内容', function () {
            //开始测试defineProperties 影响
            Object.defineProperties(Object.prototype, {
                "testThis": {
                    //__proto__: null, // 没有继承的属性
                    //是否可以删除， 默认为false
                    configurable: false,
                    //是否可以遍历， 默认为false
                    enumerable: false,
                    //值, 默认为 undefined
                    value: function (owner) {
                        //console.log(owner, this, this == owner);
                        return this == owner;
                    },
                    //是否可以写, 不能与get,set共存, 默认为 false
                    //如果为false, 可以赋值， 但不会成功
                    writable: true
                }
            });

            expect(n.testThis(n)).toEqual(true);
            expect(n1.testThis(n1)).toEqual(true);
            expect(s.testThis(s)).toEqual(true);
            expect(s1.testThis(s1)).toEqual(true);
            expect(na.testThis(na)).toEqual(false);
            expect(IN.testThis(IN)).toEqual(true);
            expect(list.testThis(list)).toEqual(true);
            expect(list1.testThis(list1)).toEqual(true);
            expect(o.testThis(o)).toEqual(true);
            expect(o1.testThis(o1)).toEqual(true);
            expect(date.testThis(date)).toEqual(true);
            expect(regx.testThis(regx)).toEqual(true);
            expect(regx1.testThis(regx1)).toEqual(true);

            expect(element.testThis(element)).toEqual(true);
            expect(win.testThis(win)).toEqual(true);
            expect(doc.testThis(doc)).toEqual(true);

        }); //end Object.prototype defineProperties

    }); //end describe defineProperties

});

//describe('bingo.Event ======>', function () {

    //    it('测试owner', function () {

    //        //但值还是obj.v1和obj.v
    //        expect(obj1.vv1()).toEqual(obj.v1());
    //        expect(obj1.vv()).toEqual(obj.v());

    //    });

//});//end bingo.Event
