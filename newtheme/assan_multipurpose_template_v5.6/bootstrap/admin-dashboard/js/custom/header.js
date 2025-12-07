//Add search js to header
document.addEventListener('DOMContentLoaded', function () {
  var toggleButtons = document.querySelectorAll('.js-search')
  var toggleContents = document.querySelectorAll('.dropdown-search')
  if (toggleButtons.length > 0) {
    toggleButtons.forEach(function (toggleButton) {
      toggleButton.addEventListener('click', function () {
        document.body.classList.toggle('is-search')
      });
    });
    document.addEventListener('click', function (event) {
      var isClickInsideButton = false
      var isClickInsideContent = false

      toggleButtons.forEach(function (toggleButton) {
        isClickInsideButton = isClickInsideButton || toggleButton.contains(event.target);
      })
      toggleContents.forEach(function (toggleContent) {
        isClickInsideContent = isClickInsideContent || toggleContent.contains(event.target);
      })
      var isClickInsideDropdown = document.body.classList.contains('is-search');
      var searchInput = document.querySelector('.dropdown-search .form-control');
      if (!isClickInsideButton && !isClickInsideContent && isClickInsideDropdown) {
        document.body.classList.remove('is-search')
      }
      if (document.body.classList.contains('is-search')) {
        setTimeout(function () {
          searchInput.focus()
        }, 0)
      }
    })
  }
});

// Get the header element shadow class
const header = document.querySelector('header');
if (header) {
  const twoPercent = 0.02 * document.body.clientHeight;
  let hasScrolledPastTwoPercent = false;
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
   if (scrollPosition > twoPercent && !hasScrolledPastTwoPercent) {
      header.classList.add('shadow-sm');
      hasScrolledPastTwoPercent = true;
    } else if (scrollPosition <= twoPercent && hasScrolledPastTwoPercent) {
      header.classList.remove('shadow-sm');
      hasScrolledPastTwoPercent = false;
    }
  });
}
