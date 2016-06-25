
(function (fps, useRAF) {
    var _reqAnimFrame = window.requestAnimationFrame,
			_cancelAnimFrame = window.cancelAnimationFrame,
			_getTime = Date.now || function () { return new Date().getTime(); },
			_lastUpdate = _getTime();


    var _ticker;

    //now try to determine the requestAnimationFrame and cancelAnimationFrame functions and if none are found, we'll use a setTimeout()/clearTimeout() polyfill.
    a = ["ms", "moz", "webkit", "o"];
    i = a.length;
    while (--i > -1 && !_reqAnimFrame) {
        _reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
        _cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
    }

    var _self = {},
	    _emptyFunc = function () { },
		_startTime = _getTime(),
		_useRAF = (useRAF !== false && _reqAnimFrame) ? "auto" : false,
		_lagThreshold = 500,
		_adjustedLag = 33,
        _tinyNum = 0.0000000001,
		_fps, _req, _id, _gap, _nextTime,
		_tick = function (manual) {
			var elapsed = _getTime() - _lastUpdate,
				overlap, dispatch;
			if (elapsed > _lagThreshold) {
				_startTime += elapsed - _adjustedLag;
			}
			_lastUpdate += elapsed;
			_self.time = (_lastUpdate - _startTime) / 1000;
			overlap = _self.time - _nextTime;
			if (!_fps || overlap > 0 || manual === true) {
				_self.frame++;
				_nextTime += overlap + (overlap >= _gap ? 0.004 : _gap - overlap);
				dispatch = true;
			}
			if (manual !== true) { //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.
				_id = _req(_tick);
			}
			if (dispatch) {
			    //_self.dispatchEvent(_tickWord);
			    document.getElementById('ticker').textContent = [_self.frame, _self.time].join(',');
			    //console.log('aaaa', _self.time, _self.frame);
			}
		};

    _self.time = _self.frame = 0;
    _self.tick = function () {
        _tick(true);
    };

    _self.lagSmoothing = function (threshold, adjustedLag) {
        _lagThreshold = threshold || (1 / _tinyNum); //zero should be interpreted as basically unlimited
        _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
    };

    _self.sleep = function () {

        if (_id == null) {
            return;
        }
        if (!_useRAF || !_cancelAnimFrame) {
            clearTimeout(_id);
        } else {
            _cancelAnimFrame(_id);
        }
        _req = _emptyFunc;
        _id = null;
        if (_self === _ticker) {
            _tickerActive = false;
        }
    };

    _self.wake = function (seamless) {
        if (_id !== null) {
            _self.sleep();
        } else if (seamless) {
            _startTime += -_lastUpdate + (_lastUpdate = _getTime());
        } else if (_self.frame > 10) { //don't trigger lagSmoothing if we're just waking up, and make sure that at least 10 frames have elapsed because of the iOS bug that we work around below with the 1.5-second setTimout().
            _lastUpdate = _getTime() - _lagThreshold + 5;
        }
        _req = (_fps === 0) ? _emptyFunc : (!_useRAF || !_reqAnimFrame) ? function (f) { return setTimeout(f, ((_nextTime - _self.time) * 1000 + 1) | 0); } : _reqAnimFrame;
        if (_self === _ticker) {
            _tickerActive = true;
        }
        _tick(2);
    };

    _self.fps = function (value) {
        if (!arguments.length) {
            return _fps;
        }
        _fps = value;
        _gap = 1 / (_fps || 60);
        _nextTime = this.time + _gap;
        _self.wake();
    };

    _self.useRAF = function (value) {
        if (!arguments.length) {
            return _useRAF;
        }
        _self.sleep();
        _useRAF = value;
        _self.fps(_fps);
    };
    _self.fps(fps);

    //a bug in iOS 6 Safari occasionally prevents the requestAnimationFrame from working initially, so we use a 1.5-second timeout that automatically falls back to setTimeout() if it senses this condition.
    setTimeout(function () {
        if (_useRAF === "auto" && _self.frame < 5 && document.visibilityState !== "hidden") {
            _self.useRAF(false);
        }
    }, 1500);

})(60, true);