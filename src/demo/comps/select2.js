
bingo.component('select2', {
    $tmpl: '<select style="visibility:visible" bg-for="item in datas" bg-model="id"><option value="{{item[idName]}}">{{bingo.htmlEncode(item[textName])}}</option></select>',
<<<<<<< HEAD
    $init: function (p) {
=======
    $init:  ['$compCfg',function (p) {
>>>>>>> master
        //$(this.$getNode()).css('visibility', 'visible');
        console.log('comp select2 init', p);
        this.$observe('id', function (c) {
            console.log(c);
            this.bgTrigger('onChange', [c]);
        });
<<<<<<< HEAD
    },
=======
    }],
>>>>>>> master
    idName: 'id', textName: 'text',
    id: '2',
    datas: [{ id: '2', text: 'text2' }],
    onChange: function (fn) {
        return this.bgOn('onChange', fn);
    }
<<<<<<< HEAD
});
=======
});



>>>>>>> master
