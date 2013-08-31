/*
	animating = GQ(element).
		style('height', 0).
		redraw().
		style('height', '').
		addClass('slide-down').
		redraw().
		one('transitionend', function (iGQ) {}).
		one('cancel', function (iGQ) {});

	animating.cancel();
*/
(function (root, globalProp) {
'use strict';

var w3cTransitionend = 'transitionend',
		w3cTransitionDuration = 'transition-duration',
		w3cTransitionDelay = 'transition-delay';

var forEach = function (arr, fn) {

	var length = arr.length;

	while (length) {
		--length;
		fn(arr[length]);
	}
};

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

/*
	I execute a callback when the transition is completed.
*/
// var end = function (fn) {

// 	function listener () {

// 		clearTimeout(transitioning);
// 		transitioning = null;
// 		el.removeEventListener('transitionend', listener);
// 		fn(that);
// 	}

// 	function cancel () {

// 		log('cancelled');
// 		if (transitioning) {
// 			listener();
// 		}
// 	}

// 	var that = this,
// 			el = that.element,
// 			transitioning = null,
// 			duration = calculateDuration(this);

// 	log('end() duration', duration);

// 	if (duration) {
// 		el.addEventListener('transitionend', listener);
// 		transitioning = setTimeout(function () {
// 			log('transition stopped by setTimeout');
// 			listener(that);
// 		}, duration);
// 	} else {
// 		fn(this);
// 	}

// 	return ({cancel: cancel});
// }

var getComputedStyle = root.getComputedStyle;

var calculateDuration = function (gqElement) {

	var duration = gqElement.style(w3cTransitionDuration);
	duration = duration ? parseFloat(duration) * 1000 : 0;
	var delay = gqElement.style(w3cTransitionDelay);
	delay = delay ? parseFloat(delay) * 1000 : 0;

	return duration + delay + 100;
};

/*
	I wrap an element in my handsomely dressed object.
*/
var gq = function (element) {

	var scope = {}, eventNames, transitionendAlreadyAttached,
			attachTransitionendListener, transitionendListeners = [],
			cancelListeners = [], detachTransitionendListener, transitionendListener;

	transitionendListener = function (e) {

		log('transitionendListener()');
		forEach(transitionendListeners, function (fn) {
			fn(scope);
		});
		detachTransitionendListener();
	};

	detachTransitionendListener = function () {

		scope.element.removeEventListener(w3cTransitionend, transitionendListener);
		transitionendAlreadyAttached = false;
		transitionendListeners = [];
	};

	attachTransitionendListener = function () {

		var listener;

		if (transitionendAlreadyAttached) { return; }

		scope.element.addEventListener(w3cTransitionend, transitionendListener);
		transitionendAlreadyAttached = true;
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

		return scope;
	};

	/*
		I add a css class.
	*/
	scope.addClass = function (cssClass) {

		// this.element.classList.add(cssClass);
		var className = scope.element.className;
		className += (className === '' ? '' : ' ') + cssClass;
		scope.element.className = className;

		return scope;
	};

	/*
		I remove a css class.
	*/
	scope.removeClass = function (cssClass) {

		// /(?:^|\s)MyClass(?!\S)/
		var re = new RegExp('(?:^|\\s)' + cssClass + '(?!\\S)');
		scope.element.className = scope.element.className.replace(re, '');

		return scope;
	};

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
		I listen for an event one time.
	*/
	scope.one = function (eventName, fn) {

		if (eventNames.split(' ').indexOf(eventName) === -1) {
			throw eventName + ' is not an acceptable event. ' + eventNames + ' only' +
				'possible values';
		}

		if (!isFunction(fn)) {
			throw '2nd argument must be a function.';
		}

		if (eventName === 'transitionend') {
			transitionendListeners.push(fn);
			attachTransitionendListener();
		}

		if (eventName === 'cancel') {
			cancelListeners.push(fn);
		}

		return scope;
	};

	/*
		Cancel a running animation.
	*/
	scope.cancel = function () {

		forEach(cancelListeners, function (fn) { fn(scope); });
		cancelListeners = [];
		detachTransitionendListener();
	};

	eventNames = 'transitionend cancel';
	transitionendAlreadyAttached = false;

	return scope;
};

// Export to global
window[globalProp] = gq;

})(window, 'GQ');