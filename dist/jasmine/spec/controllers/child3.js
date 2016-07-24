
bingo.app('test').controller('child3', function ($view, $cache) {
    var list = $cache('childMainList');
    list.push('child3');
    $view.title = 'asdfasdfasdf';

    $view.$init(function () {
        list.push('child3 init');
    });

    $view.$ready(function () {
        list.push('child3 ready');
    });


});