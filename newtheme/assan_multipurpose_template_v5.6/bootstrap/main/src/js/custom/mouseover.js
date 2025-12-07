const jsmouseOver = document.querySelectorAll('.js-mouseover');

jsmouseOver.forEach((parent) => {
  const linkmouseover = parent.querySelector('.link-mouseover');
  let requestId; parent.addEventListener('mousemove', (event) => {
    const parentRect = parent.getBoundingClientRect();
    const x = event.clientX - parentRect.left;
    const y = event.clientY - parentRect.top;
    cancelAnimationFrame(requestId);
    requestId = requestAnimationFrame(() => {
      linkmouseover.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1)`;
    });
  });
  parent.addEventListener('mouseleave', () => {
    cancelAnimationFrame(requestId);
    linkmouseover.style.transform = 'translate3d(0, 0, 0) scale(0.25)';
  });
});
