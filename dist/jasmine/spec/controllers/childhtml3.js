
bingo.app('test').controller('childhtml3', function ($view, $cache, testSrv) {
    var list = $cache('childMainListHtml');
    list.push('child3_a');
    $view.title = 'asdfasdfasdf';

    $view.$init(function () {
        list.push('child3 init');
    });

    $view.$ready(function () {
        list.push('child3 ready');
    });


});