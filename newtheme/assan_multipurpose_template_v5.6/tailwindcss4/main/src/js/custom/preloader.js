//For Live Projects
// Add a 'loading' class to the body when a new page is being loaded
document.addEventListener("DOMContentLoaded", function() {
  document.querySelector("body").classList.add("loading");
});

// Remove the 'loading' class from the body when the page is loaded
window.addEventListener("load", function() {
  document.querySelector("body").classList.remove("loading");
  document.querySelector("body").classList.add("loaded");
});

// Display the preloader when a new page is being loaded
window.addEventListener("beforeunload", function() {
  document.querySelector("body").classList.add("loading");
});