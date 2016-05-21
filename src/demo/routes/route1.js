
<<<<<<< HEAD
bingo.app('demo').controller('routes/route1', function ($view, $comp, $location) {
    $view.title = 'route1';
    $view.desc = 'route1 OK';
    console.log('route1 cp select1', $comp('select1'), $comp('select1').datas);
=======
demoApp.controller('route1', function ($view, $location) {
    $view.title = 'route1';
    $view.desc = 'route1 OK'+new Date();
>>>>>>> master

    $view.$ready(function () {
        console.log('route1 ready');
    });

<<<<<<< HEAD
    $view.$readyAll(function () {
        console.log('route1 readyall');
    });

    $view.reload = function () {
        $location().reload();
    };
    $view.route2 = function () {
        $location().href('routes/route2');
    };
});
=======
    $view.reload = function () {
        $location('main').reload();
    };
    $view.route2 = function () {
        $location('main').href('route2');
    };
    $view.bgOnDispose(function () {
        console.log('dispose route1');
    });

});
>>>>>>> master
