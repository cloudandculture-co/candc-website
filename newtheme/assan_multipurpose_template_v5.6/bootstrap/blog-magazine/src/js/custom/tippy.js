

/*
* Website - https://atomiks.github.io/tippyjs/
* Required - https://popper.js.org/
* TIPPY JS PLUGIN For Advanced Tooltips and Popovers
*/

import "@popperjs/core"
import tippy from 'tippy.js'
tippy('[data-tippy-content]',{
    allowHTML: true,
    animation:"shift-toward"
});
