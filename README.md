## GQ.

**Warning Library is still a WIP.**
Javascript library for moving with elegance (CSS transitions).

GQ was created to provide an easier way of creating programmatic CSS 3
transitions without any dependencies on jQuery or other libraries. Unlike
other transition plugins/libraries, GQ allows for applying transitions
using css styles and css classes.

## Example

<pre><code>var complete = function (iGQ) {

	iGQ.
		removeClass('in').
		removeClass('fade');
};

var el = document.getElementById('foo');
var iGQ = GQ(el);
iGQ.
	addClass('fade').
	when('transitionend', complete).
	when('cancel', complete).
	transition(function (iGQ) {
		iGQ.
			redraw().
			addClass('in');
	});

if (iGQ.isTransitioning()) {
	iGQ.cancel();
}</code></pre>

## Public API

All publically available methods/properties are explained in this section.
Methods/properties are available on object returned from gq(element).

**element**

Element passed to gq().

**addClass(** *cssClass* **)**

Add css class to element.

**removeClass(** *cssClass* **)**

Remove css class from element.

**hasClass(** *cssClass* **)**

Check if css class exists on element.

**style(** *property*, *[value]* **)**

When passed with 1st argument only, get computed style property. When
passed with both arguments, set style property to value.

**redraw()**

Forces a dom redraw. Useful for ensuring css properties get changed and
not batched.

**transition(** *function* **)**

Wrapper for applying styles or classes to apply a transition. Automatically
hooks up transitionend event listener as well as a timeout in case
transitionend does not get fired.

**isTransitioning()**

Way to check if GQ instance is currently transitioning. Useful for check
before calling cancel().

**cancel()**

Cancel current transition and trigger **"cancel"** event.

**when(** *eventName*, *function* **)**

Executes registered functions when event is triggered. Events available
are...

* transitionend
* cancel
