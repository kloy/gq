(function () {
'use strict';

var $ = function (id) { return document.getElementById(id); };

var animateFade = function () {

	var complete = function (iGQ) {

		console.debug('transitionend() fn', iGQ);
		iGQ.removeClass('in').removeClass('fade');
		showFadeControl();
	};

	return GQ($('fade-block')).
		addClass('fade').
		when('transitionend', complete).
		when('cancel', complete).
		transition(function (iGQ) { iGQ.redraw().addClass('in'); });
};

var animateCollapse = function () {

	var complete = function (iGQ) {

		iGQ.removeClass('in').removeClass('collapse').style('height', '');
		showCollapseControls();
	};

	var $gq = GQ($('collapse-block'));
	$gq.
		style('visibility', 'hidden').
		style('height', 'auto').
		redraw();

	var toHeight = $gq.style('height');
	console.debug('toHeight', toHeight);

	$gq.style('visibility', '').
		style('height', '').
		addClass('collapse').
		when('transitionend', complete).
		when('cancel', complete).
		transition(function (iGQ) {

			iGQ.addClass('in').redraw().style('height', toHeight);
		});

	return $gq;
};

var showFadeControl = function () {

	GQ($triggerFade).removeClass('hide');
	GQ($cancelFade).addClass('hide');
};

var hideFadeControl = function () {

	GQ($triggerFade).addClass('hide');
	GQ($cancelFade).removeClass('hide');
};

var showCollapseControls = function () {

	GQ($triggerCollapse).removeClass('hide');
	GQ($cancelCollapse).addClass('hide');
};

var hideCollapseControls = function () {

	GQ($triggerCollapse).addClass('hide');
	GQ($cancelCollapse).removeClass('hide');
};

var animatingFade,
		animatingCollapse,
		$triggerFade = $('trigger-fade'),
		$cancelFade = $('cancel-fade'),
		$triggerCollapse = $('trigger-collapse'),
		$cancelCollapse = $('cancel-collapse');

$triggerFade.addEventListener('click', function (e) {

	animatingFade = animateFade();
	hideFadeControl();
});

$cancelFade.addEventListener('click', function (e) {

	animatingFade.cancel();
	console.log('fade cancel clicked');
	showFadeControl();
});

$triggerCollapse.addEventListener('click', function (e) {

	animatingCollapse = animateCollapse();
	hideCollapseControls();
});

$cancelCollapse.addEventListener('click', function (e) {

	animatingCollapse.cancel();
	showCollapseControls();
});

})();