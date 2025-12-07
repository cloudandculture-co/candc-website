import Headroom from "headroom.js";
const navbarSitcky = document.querySelectorAll(".navbar-sticky");
navbarSitcky.forEach(function(e){
    var headroom  = new Headroom(e);
    headroom.init()
})
