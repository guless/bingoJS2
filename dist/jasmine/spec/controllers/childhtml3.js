
bingo.app('test').controller('childhtml3', function ($view, $cache) {
    var list = $cache('childMainListHtml');
    list.push('child3');
    $view.title = 'asdfasdfasdf';

    $view.$init(function () {
        list.push('child3 init');
    });

    $view.$ready(function () {
        list.push('child3 ready');
    });


});