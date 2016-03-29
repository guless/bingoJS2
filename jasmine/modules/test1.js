
bingo.controller('test1', function ($view, $comp) {
    $view.title = 'test1';
    $view.desc = 'test1 OK';
    console.log('test1 cp select1', $comp('select1'), $comp('select1').datas);

    $view.$ready(function () {
        console.log('test1 ready');
    });

    $view.$readyAll(function () {
        console.log('test1 readyall');
    });
});