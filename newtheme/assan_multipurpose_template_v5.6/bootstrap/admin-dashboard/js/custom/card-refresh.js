// get all the refresh buttons
const refreshButtons = document.querySelectorAll('.btn-refresh');

// loop through each refresh button and add a click event listener
refreshButtons.forEach(button => {
  button.addEventListener('click', () => {
    // get the parent element of the refresh button
    const parentElement = button.closest('.card');

    // get the loader element inside the parent element
    const loaderElement = parentElement.querySelector('.loader-refresh');

    // show the loader element by adding the 'active' class
    loaderElement.classList.add('active');

    // set a timeout to hide the loader after 300ms
    setTimeout(() => {
      loaderElement.classList.remove('active');
    }, 500);
  });
});
