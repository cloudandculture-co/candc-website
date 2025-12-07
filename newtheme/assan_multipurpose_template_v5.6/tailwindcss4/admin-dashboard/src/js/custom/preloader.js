  
  //Preloader
  document.addEventListener("DOMContentLoaded", function() {
    // Check if preloader exists
    const preloader = document.getElementById('app_preloader');
    if (preloader) {
        window.onload = function() {
            setTimeout(function() {
                preloader.classList.add('hidden');
            }, 1000);
        };
    }
  });