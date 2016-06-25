
demoApp.command('ex/html', function (cp) {

    cp.$layout(function () {
        return cp.$attrs.$result();
    }, function (c) {
        return cp.$html(c.value);
    });

});