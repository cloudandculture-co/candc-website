window.bootstrap = require('bootstrap/dist/js/bootstrap.js');


//Toast notifications
var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl)
})


//collapse for sidebar
document.querySelectorAll(".collapse-group .collapse").forEach((e => {
  const t = new bootstrap.Collapse(e, { toggle: !1 });
  e.addEventListener("show.bs.collapse", (a => {
    a.stopPropagation();
    e.parentElement.closest(".collapse").querySelectorAll(".collapse").forEach((e => {
      const a = bootstrap.Collapse.getInstance(e);
      a !== t && a.hide()
    }))
  })), e.addEventListener("hide.bs.collapse", (t => {
    t.stopPropagation();
    e.querySelectorAll(".collapse").forEach((e => { bootstrap.Collapse.getInstance(e).hide() }))
  }))
}));

//Modal shown input autoFocus
const myModalEl = document.querySelectorAll('.modal')
myModalEl.forEach(function(el) {
  el.addEventListener('shown.bs.modal', event =>{
    event.preventDefault();
    var input = document.querySelector("[autofocus]");
    input.focus();
  })  
});