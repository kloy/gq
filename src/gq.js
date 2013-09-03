/*
	GQ - Library for programmatic CSS 3 Transitions.

	@author Keith Loy
	@license MIT

	Way this is expected to work...

	animating = GQ(element).
		style('height', 0).
		redraw().
		style('height', '').
		when('transitionend', function (iGQ) {}).
		when('cancel', function (iGQ) {}).
		transition(function (iGQ) {});

	if (animating.isTransitioning()) { animating.cancel(); }
*/
(function (root, globalProp) {
'use strict';

var w3cTransitionend = 'transitionend',
		w3cTransitionDuration = 'transition-duration',
		w3cTransitionDelay = 'transition-delay';

var isDefined = function (value) {

	return (typeof value !== 'undefined');
};

var isFunction = function (fn) {

	return (typeof fn === 'function');
};

var log = function () {

	if (isDefined(console) && isFunction(console.log)) {
		console.log.apply(console, arguments);
	}
};

var forEach = function (arr, fn) {

	var length = arr.length;

	while (length) {
		--length;
		fn(arr[length]);
	}
};

var sniff = (function () {

	var detection = {},
			style = document.body.style;

	log('styles', document.body.style);
	if ('transitionDuration' in style) {
		detection.transitionDuration = 'transition-duration';
		detection.transitionend = 'transitionend';
	} else if ('webkitTransitDuration' in style) {
		detection.transitionDuration = '-webkit-transition-duration';
		detection.transitionend = 'webkitTransitionEnd';
	} else {
		detection.transitionDuration = null;
		detection.transitionend = null;
	}

	if ('transitionDelay' in style) {
		detection.transitionDelay = 'transition-delay';
	} else if ('webkitTransitDelay' in style) {
		detection.transitionDelay = '-webkit-transition-delay';
	} else {
		detection.transitionDelay = null;
	}

	detection.canTransition = detection.transitionend ? true : false;

	return detection;
})();

var getComputedStyle = root.getComputedStyle;

var calculateDuration = function (iGQ) {

	var durationVal = iGQ.style(sniff.transitionDuration),
			delayVal = iGQ.style(sniff.transitionDelay),
			duration = parseFloat(durationVal),
			delay = parseFloat(delayVal);

	log('transitionDuration', durationVal, duration);
	log('transitionDelay', delayVal, delay);

	if (durationVal.indexOf('ms') === -1 && duration) {
		duration = duration * 1000;
	}
	if (delayVal.indexOf('ms') === -1 && delay) {
		delay = delay * 1000;
	}

	return (duration + delay) ? duration + delay  + 100 : 0;
};

/*
	I wrap an element in my handsomely dressed object.
*/
var gq = function (element) {

	var scope = {},
			eventNames = 'transitionend cancel',
			transitioning = false,
			transitionendListeners = [],
			cancelListeners = [],
			attachTransitionendListener,
			transitionendTimeout,
			detachTransitionendListener,
			transitionendListener;

	transitionendListener = function (e) {

		log('transitionendListener()');
		forEach(transitionendListeners, function (fn) { fn(scope); });
		transitionendListeners = [];
		detachTransitionendListener();
		transitioning = false;
	};

	detachTransitionendListener = function () {

		scope.element.removeEventListener(
			sniff.transitionend, transitionendListener
		);
		clearTimeout(transitionendTimeout);
	};

	attachTransitionendListener = function () {

		var duration = calculateDuration(scope);

		scope.element.addEventListener(sniff.transitionend, transitionendListener);

		log('calculated duration', duration);
		if (duration) {
			transitionendTimeout = setTimeout(transitionendListener, duration);
		}
	};

	scope.element = element;

	/*
		I return the value of the requested css style property when no value is given.
		When a value is given I set the css style property to given value.
	*/
	scope.style = function (property, value) {

		if (isDefined(value)) {
			scope.element.style[property] = value;
		} else {
			return getComputedStyle(scope.element)[property];
		}
		log('style() ', scope.element.style);

		return scope;
	};

	/*
		I add a css class.
	*/
	scope.addClass = function (cssClass) {

		// this.element.classList.add(cssClass);
		var className = scope.element.className;

		if (!scope.hasClass(cssClass)) {
			className += (className === '' ? '' : ' ') + cssClass;
			scope.element.className = className;
		}

		log('addClass() className: %s', cssClass, scope.element.className);

		return scope;
	};

	/*
		I remove a css class.
	*/
	scope.removeClass = function (cssClass) {

		// /(?:^|\s)MyClass(?!\S)/
		var re = new RegExp('(?:^|\\s)' + cssClass + '(?!\\S)');

		if (scope.hasClass(cssClass)) {
			scope.element.className = scope.element.className.replace(re, '');
		}

		log('removeClass() className: %s', cssClass, scope.element.className);

		return scope;
	};

	/*
		I check if an element has passed class.
	*/
	scope.hasClass = function (cssClass) {

		return (scope.element.className.indexOf(cssClass) !== -1);
	};

	/*
		I force a redraw of the dom.
	*/
	scope.redraw = function () {

		// By accessing offsetHeight we force a dom redraw.
		element.offsetHeight;

		return scope;
	};

	/*
		I expose whether or not the element is transitioning.
	*/
	scope.isTransitioning = function () { return transitioning; };

	/*
		I execute a callback to initiate a transitioning and setup
		transitionend event listeneing.
	*/
	scope.transition = function (transitionFn) {

		// if already transitioning cancel
		if (scope.isTransitioning()) { scope.cancel(); }

		transitionFn(scope);
		transitioning = true;

		if (!sniff.canTransition) { transitionendListener(); }
		else { attachTransitionendListener(); }

		return scope;
	};

	/*
		I listen for an event one time. "When" events should be hooked up before
		doing a transition.
	*/
	scope.when = function (eventName, fn) {

		if (eventNames.split(' ').indexOf(eventName) === -1) {
			throw eventName + ' is not an acceptable event. ' + eventNames + ' only' +
				'possible values';
		}
		if (!isFunction(fn)) { throw '2nd argument must be a function.'; }
		if (eventName === 'transitionend') { transitionendListeners.push(fn); }
		if (eventName === 'cancel') { cancelListeners.push(fn); }

		return scope;
	};

	/*
		I cancel a running animation.
	*/
	scope.cancel = function () {

		forEach(cancelListeners, function (fn) { fn(scope); });
		cancelListeners = [];
		detachTransitionendListener();
		transitioning = false;
	};

	return scope;
};

// Export to global
window[globalProp] = gq;

})(window, 'GQ');