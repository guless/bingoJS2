
demoApp.service('service1', ['$view', 'service2', function ($view, service2) {
    console.log('service1', arguments);
    return { name: 'service1', service2:service2 };
}]);