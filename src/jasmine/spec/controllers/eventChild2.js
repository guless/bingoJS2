
bingo.app('test').controller('eventChild2', ['$view', 'testSrv', function ($view, testSrv) {
    bbbb.push('eventChild2');

    $view.$init(function () {
        bbbb.push('eventChild2 init');
        return bingo.Promise(function (r) { setTimeout(function () { r(); }, 1000); });
    });

    $view.$ready(function () {
        bbbb.push('eventChild2 ready');
    });

    $view.bgOnDispose(function () {
    });

}]);

