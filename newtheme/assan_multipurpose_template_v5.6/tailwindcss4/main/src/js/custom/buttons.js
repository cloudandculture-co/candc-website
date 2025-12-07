const btnRipples = document.querySelectorAll('.btn-blur');

btnRipples.forEach(btnRipple => {
  btnRipple.addEventListener('mousemove', function(e) {
    const rect = btnRipple.getBoundingClientRect();
    const circle = btnRipple.querySelector('.btn-blur-circle');
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    circle.style.left = x + 'px';
    circle.style.top = y + 'px';
  });
  
  btnRipple.addEventListener('mouseleave', function() {
    const circle = btnRipple.querySelector('.btn-blur-circle');
    circle.style.left = '50%';
    circle.style.top = '50%';
  });
});