
bingo.component('select2', {
    $tmpl: '<select style="visibility:visible" bg-for="item in datas" bg-model="id"><option value="{{item[idName]}}">{{bingo.htmlEncode(item[textName])}}</option></select>',
    $init: function () {
        //$(this.$getNode()).css('visibility', 'visible');
        console.log('comp select2 init');
        this.$observe('id', function (c) {
            console.log(c);
            this.bgTrigger('onChange', [c]);
        });
    },
    idName: 'id', textName: 'text',
    id: '2',
    datas: [{ id: '2', text: 'text2' }],
    onChange: function (fn) {
        return this.bgOn('onChange', fn);
    }
});