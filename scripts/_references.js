/// <reference path="intellisenseDef.js" />
/// <reference path="../js/bingo2/jLite.js" />
/// <reference path="../js/jquery/jquery-1.8.1.js" />
/// <reference path="../js/bingo2/core.js" />
/// <reference path="../js/bingo2/promise.js" />
/// <reference path="../js/bingo2/event.js" />
/// <reference path="../js/bingo2/observe.js" />
/// <reference path="../js/bingo2/equals.js" />
/// <reference path="../js/bingo2/using.js" />
/// <reference path="../js/bingo2/package.js" />
/// <reference path="../js/bingo2/linkNode.js" />
/// <reference path="../js/bingo2/route.js" />
/// <reference path="../js/bingo2/location.js" />
/// <reference path="../js/bingo2/compiles.js" />
/// <reference path="../js/bingo2/service/base.js" />
/// <reference path="../js/bingo2/command/base.js" />

(function (bingo) {
    window._newTraParam = function() {
        return {
            node: null,
            pViewnode: null, view: null, data: null,
            withData: null, ctrl: null,
            withDataList: null, build: {}, traves: {}
        };
    };
    var injec = window.bg_intellisense = {
        pView: new bingo.viewClass()
    };
    injec.pViewNode = new bingo.viewnodeClass(_bg_intellisense.pView, document.body, null, {});

    bingo.rootView = function () {
        return new bingo.viewClass(_pView);
    };


    window._attrObj_ = {
        attrs: [],
        usings: [],
        texts: [],
        replace: false,
        include: false,
        compileChild: true,
        tmpl: null,
        promises: [],
        isNewView: false
    };

})(bingoV2);