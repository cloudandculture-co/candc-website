/*
* Website - https://github.com/cferdinandi/smooth-scroll
* Smooth Scroll on link click JS PLUGIN [Default css is not working in safari so we added a minimal js plugin for it.]
*/

import SmoothScroll from 'smooth-scroll';
var scroll = new SmoothScroll('a[href*="#"]', {
	speed: 700,
	speedAsDuration: true,
    updateURL:false
});


