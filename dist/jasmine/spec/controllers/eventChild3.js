
bingo.app('test').controller('eventChild3', ['$view', 'testSrv', function ($view, testSrv) {
    bbbb.push('eventChild3');

    $view.$init(function () {
        bbbb.push('eventChild3 init');
        return bingo.Promise(function (r) { setTimeout(function () { r(); }, 1000); });
    });

    $view.$ready(function () {
        bbbb.push('eventChild3 ready');
    });

    $view.bgOnDispose(function () {
    });

}]);

