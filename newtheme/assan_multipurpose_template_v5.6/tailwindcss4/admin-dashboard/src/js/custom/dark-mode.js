//Dark Mode Script
document.addEventListener("DOMContentLoaded", function() {
    const toggleButtons = document.querySelectorAll(".toggle-mode");
    const htmlTag = document.documentElement;
  
    // Check if the class was previously added and add it if necessary
    if (localStorage.getItem("hasClass")) {
      htmlTag.classList.add("dark");
    }
  
    toggleButtons.forEach(button => {
      button.addEventListener("click", function() {
        // Toggle the class on button click for the <html> tag
        htmlTag.classList.toggle("dark");
  
        // Store the state of the class in localStorage
        if (htmlTag.classList.contains("dark")) {
          localStorage.setItem("hasClass", true);
        } else {
          localStorage.removeItem("hasClass");
        }
      });
    });
  });