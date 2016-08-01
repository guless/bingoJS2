
demoApp.service('service2', ['$view', function ($view) {
    console.log('service2', arguments);
    return { name: 'service2' };
}]);