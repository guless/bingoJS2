
demoApp.service('service1', ['$view', 'service2', function ($view, service2) {
    console.log('service1', arguments);
    $view.$init(function () {
        console.log('child3 init');

        return bingo.Promise(function (r) { setTimeout(function () { r(); }, 2000); });
    });

    return { name: 'service1', service2:service2 };
}]);