
(function () {
    var app = bingo.app('test');

    app.service('testSrv', function ($view) {
        return { isOk: true };
    });

})();