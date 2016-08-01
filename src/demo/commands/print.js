
demoApp.command('print', function (cp) {

    cp.$layout(function () {
        return cp.$attrs.$result();
    }, function (c) {
        return cp.$text(c.value);
    });

});