//BackToTop
// function trackScroll() {
//     var scrolled = window.pageYOffset;
//     var coords = document.documentElement.clientHeight;

//     if (scrolled > coords) {
//         goTopBtn.classList.add("show");
//     }
//     if (scrolled < coords) {
//         goTopBtn.classList.remove("show");
//     }
// }
// var goTopBtn = document.querySelector(".toTop");
// if(goTopBtn){
//     window.addEventListener("scroll", trackScroll);
// }
document.addEventListener('DOMContentLoaded', () => {
  const circle = document.querySelector('.progress-circle circle');

  if (circle) {
      const circleLength = circle.getTotalLength();
      const pageProgress = document.querySelector('.toTop');
      circle.style.strokeDasharray = circleLength;
      circle.style.strokeDashoffset = circleLength;

      window.addEventListener('scroll', () => {
          const scrollPercent = (document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight);

          if (scrollPercent >= 0.2) {
              pageProgress.classList.add('show');
          } else {
              pageProgress.classList.remove('show');
          }
          const drawLength = circleLength * scrollPercent;
          circle.style.strokeDashoffset = circleLength - drawLength;
      });
  }
});
