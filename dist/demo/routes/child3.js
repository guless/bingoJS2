
demoApp.controller('child3', ['$view', 'service1', function ($view, service1) {
    console.log('child3');

    $view.contents = 'test child3';

    $view.$init(function () {
        console.log('child3 init');
  
        return bingo.Promise(function (r) { setTimeout(function () { r();}, 1000); });
    });

    $view.$ready(function () {
        console.log('child3 ready');
    });

    $view.bgOnDispose(function () {
        console.log('child3 dispose');
    });

}]);

