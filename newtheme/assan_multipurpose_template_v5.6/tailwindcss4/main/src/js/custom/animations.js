//On scroll text split
function splitText() {
  const animatedTextElements = document.querySelectorAll('[data-text-split]');
  if (!animatedTextElements.length) return;
  animatedTextElements.forEach((element) => {
    if (element.animation) {
      element.animation.progress(1).kill();
      element.split.revert();
    }
    element.split = new SplitText(element, {
      type: "lines,words,chars",
      linesClass: "split-line",
    });

    gsap.set(element, { perspective: 400 });

    gsap.set(element.split.chars, {
      opacity: 0,
      x: 50,
    });

    element.animation = gsap.to(element.split.chars, {
      scrollTrigger: { trigger: element, start: "top 85%" },
      x: 0,
      y: 0,
      rotateX: 0,
      opacity: 1,
      duration: 1,
      ease: "back.out(1.7)",
      stagger: 0.02,
    });
  });
}

//On scroll animations
function commonAnimation() {
  gsap.registerPlugin(ScrollTrigger);

  const elements = document.querySelectorAll("[data-animation]");
  if (!elements.length) return;

  elements.forEach((element) => {
    const animationType = element.getAttribute("data-animation");
    const delay = parseFloat(element.getAttribute("data-delay")) || 0;
    const duration = parseFloat(element.getAttribute("data-duration")) || 1;

    let fromVars = {};
    let toVars = {
      duration: duration,
      ease: "power3.out",
      delay: delay,
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: false
      }
    };
    switch (animationType) {
      case "fadeInUp":
        fromVars = { opacity: 0, y: 50 };
        toVars = { ...toVars, opacity: 1, y: 0 };
        break;
      case "fadeInRight":
        fromVars = { opacity: 0, x: 100 };
        toVars = { ...toVars, opacity: 1, x: 0 };
        break;
      case "fadeInLeft":
        fromVars = { opacity: 0, x: -100 };
        toVars = { ...toVars, opacity: 1, x: 0 };
        break;
      case "fadeInDown":
        fromVars = { opacity: 0, y: -50 };
        toVars = { ...toVars, opacity: 1, y: 0 };
        break;
      case "zoomIn":
        fromVars = { opacity: 0, scale: 0.5 };
        toVars = { ...toVars, opacity: 1, scale: 1 };
        break;
      case "zoomOut":
        fromVars = { opacity: 0, scale: 1.5 };
        toVars = { ...toVars, opacity: 1, scale: 1 };
        break;
      default:
        return;
    }

    gsap.fromTo(element, fromVars, toVars);
  });
}

//Countup
function countUpAnimation() {
  gsap.registerPlugin(ScrollTrigger);

  const elements = document.querySelectorAll("[data-countup]");
  if (!elements.length) return;

  elements.forEach((element) => {
    const target = parseFloat(element.getAttribute("data-countup")) || 0;
    const prefix = element.getAttribute("data-prefix") || "";
    const suffix = element.getAttribute("data-suffix") || "";

    // Start from 0
    let obj = { value: 0 };

    gsap.to(obj, {
      value: target,
      duration: 3,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: false
      },
      onUpdate: () => {
        element.textContent = prefix + Math.floor(obj.value) + suffix;
      }
    });
  });
}


//typed text
function typedTextAnimation() {
   let hasTextPlugin = false;
  try {
    gsap.registerPlugin(TextPlugin);
    hasTextPlugin = true;
  } catch (err) {
    hasTextPlugin = false;
  }

  const elements = document.querySelectorAll("[data-type-text]");
  if (!elements.length) return;
  if (!document.getElementById("typed-cursor-style")) {
    const style = document.createElement("style");
    style.id = "typed-cursor-style";
    style.textContent = `
      @keyframes typed-blink {
        0%,50% { opacity: 1; }
        51%,100% { opacity: 0; }
      }
      .gsap-typed-cursor {
        display: inline-block;
        animation: typed-blink 1s steps(2,start) infinite;
        vertical-align: bottom;
      }
    `;
    document.head.appendChild(style);
  }
  elements.forEach((element) => {
    let raw = element.getAttribute("data-type-text") || "[]";
    let words;
    try {
      words = JSON.parse(raw);
    } catch (e) {
      const s = raw.replace(/^[\[\]\s]+|[\[\]\s]+$/g, "");
      words = s ? s.split(",").map(w => w.trim().replace(/^['"]|['"]$/g, "")) : [];
    }
    if (!Array.isArray(words) || !words.length) return;
    const mode = (element.getAttribute("data-type-mode") || "typed").toLowerCase();
    if (element._typedTimeline) {
      try { element._typedTimeline.kill(); } catch (e) {}
    }
    const maxWord = words.reduce((a, b) => (a.length > b.length ? a : b));
    
    element.style.display = "inline-block";
    element.style.verticalAlign = "bottom";
  element.innerHTML = "";
    const textSpan = document.createElement("span");
    textSpan.className = "gsap-typed-text";
    textSpan.style.display = "inline-block";
    textSpan.style.whiteSpace = "nowrap";
    const cursorSpan = document.createElement("span");
    cursorSpan.className = "gsap-typed-cursor";
    cursorSpan.textContent = element.getAttribute("data-type-cursor") || "|";

    element.appendChild(textSpan);
    element.appendChild(cursorSpan);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: parseFloat(element.getAttribute("data-type-delay")) || 0.5 });
    element._typedTimeline = tl;

    if (mode === "fade") {
      textSpan.textContent = words[0];
      textSpan.style.opacity = 1;

      words.forEach((word) => {
        tl.to(textSpan, {
          duration: 0.6,
          opacity: 0,
          ease: "power2.inOut",
          onComplete: () => { textSpan.textContent = word; }
        });
        tl.to(textSpan, { duration: 0.6, opacity: 1, ease: "power2.out" });
        tl.to({}, { duration: parseFloat(element.getAttribute("data-type-hold")) || 2 });
      });
    } else {
      textSpan.textContent = "";
      textSpan.style.opacity = 1;

      words.forEach((word) => {
        if (hasTextPlugin) {
          tl.to(textSpan, {
            duration: Math.max(0.4, word.length * 0.08),
            text: word,
            ease: "none"
          });
        } else {
          const obj = { i: 0 };
          tl.to(obj, {
            i: word.length,
            duration: Math.max(0.4, word.length * 0.08),
            ease: "none",
            onUpdate: () => { textSpan.textContent = word.slice(0, Math.round(obj.i)); }
          });
        }
        tl.to({}, { duration: parseFloat(element.getAttribute("data-type-hold")) || 1.6 });
        if (hasTextPlugin) {
          tl.to(textSpan, {
            duration: Math.max(0.25, word.length * 0.05),
            text: "",
            ease: "none"
          });
        } else {
          const obj2 = { i: word.length };
          tl.to(obj2, {
            i: 0,
            duration: Math.max(0.25, word.length * 0.05),
            ease: "none",
            onUpdate: () => { textSpan.textContent = word.slice(0, Math.round(obj2.i)); }
          });
        }
      });
    }
  });
}


//Pricing toggle
function PricePlanUpdate() {
  const switchInput = document.querySelector('#planSwitch[data-as-toggle="price"]');
  const prices = document.querySelectorAll('.price[data-as-annual][data-as-monthly]');
  if (!switchInput || !prices.length) return;

  // Set initial values
  prices.forEach((el) => {
    el.textContent = switchInput.checked
      ? el.getAttribute("data-as-annual")
      : el.getAttribute("data-as-monthly");
  });

  function animatePrice(el, newValue) {
    let obj = { value: parseFloat(el.textContent) || 0 };
    let targetValue = parseFloat(newValue);

    gsap.to(obj, {
      value: targetValue,
      duration: 1,
      ease: "power3.out",
      onUpdate: function () {
        el.textContent = Math.floor(obj.value);
      }
    });
  }

  switchInput.addEventListener("change", () => {
    prices.forEach((el) => {
      const newValue = switchInput.checked
        ? el.getAttribute("data-as-annual")
        : el.getAttribute("data-as-monthly");
      animatePrice(el, newValue);
    });
  });
}

//Translate element vertical
function initTrasnlateY() {
 const circles = document.querySelectorAll("[data-animation-y]");
  if (!circles.length) return;

  circles.forEach(circle => {
    gsap.to(circle, {
      ease: "none",
      scrollTrigger: {
         start: "top bottom",
            end: "bottom top",
        scrub: 1,
      },
      y: 150,
    });
  });
}
//Translate element vertical 2
function initTrasnlateY2() {
 const circles = document.querySelectorAll("[data-animation-y-2]");
  if (!circles.length) return;

  circles.forEach(circle => {
    gsap.to(circle, {
      ease: "none",
      scrollTrigger: {
         start: "top bottom",
            end: "bottom top",
        scrub: 1,
      },
      y: -150,
    });
  });
}

//Translate element horizonta
function initTrasnlateX() {
 const circles = document.querySelectorAll("[data-animation-x]");
  if (!circles.length) return;

  circles.forEach(circle => {
    gsap.to(circle, {
      ease: "none",
      scrollTrigger: {
         start: "top bottom",
            end: "bottom top",
        scrub: 1,
      },
      x: 150,
    });
  });
}

//Sticky card on scroll
function initStackCards() {
  const sections = document.querySelectorAll("[data-stack]");
  if (!sections.length) return;

  sections.forEach((panel, i) => {
    if (i === 0) return; // first one stays full size

    ScrollTrigger.create({
      trigger: panel,
      start: "top center",
      end: "top top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress; // 0 → 1
        gsap.to(sections[i - 1], {
          scale: 1 - 0.25 * progress, // scale down up to 0.85
          overwrite: "auto",
          ease: "power1.out"
        });
      }
    });
  });
}

//Image hover effect
function elasticHoverdistort() {
 const cards = document.querySelectorAll("[data-distort-card]");
  if (!cards.length) return;

  cards.forEach((card) => {
    const disp = card.querySelector("feDisplacementMap");

    card.addEventListener("mousemove", () => {
      gsap.to(disp, { 
        attr: { scale: 60 }, 
        duration: 0.4, 
        ease: "power2.out" 
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(disp, { 
        attr: { scale: 0 }, 
        duration: 0.8, 
        ease: "elastic.out(1, 0.3)" 
      });
    });
  });
}

//image reveal on hover
function ImageReveal() {
  const links = document.querySelectorAll("[data-image]");
  if (!links.length) return; // stop if nothing found

  let reveal = document.getElementById("imageReveal");
  if (!reveal) {
    reveal = document.createElement("div");
    reveal.id = "imageReveal";
    document.body.appendChild(reveal);
  }

  reveal.style.position = "fixed";
  reveal.style.top = "0";
  reveal.style.left = "0";
  reveal.style.pointerEvents = "none";
  reveal.style.zIndex = "999";
  reveal.style.opacity = "0";

  links.forEach((link) => {
    const imgSrc = link.getAttribute("data-image");

    link.addEventListener("mouseenter", () => {
      reveal.innerHTML = `<img src="${imgSrc}" style="max-width:180px;height:auto;display:block; border-radius:1rem" />`;
    });

    link.addEventListener("mousemove", (e) => {
      gsap.to(reveal, {
        x: e.clientX + 20,
        y: e.clientY - 90,
        opacity: 1,
          rotate: 3,
          scale: 1,
          duration: 0.4,
          ease: "power3.out"
      });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(reveal, {
        opacity: 0,
        duration: 0.5,
        ease: "power3.out"
      });
    });
  });
}

// Call on DOM load
document.addEventListener("DOMContentLoaded", ImageReveal);
document.addEventListener("DOMContentLoaded", elasticHoverdistort);
document.addEventListener("DOMContentLoaded", initStackCards);
document.addEventListener("DOMContentLoaded", PricePlanUpdate);
document.addEventListener("DOMContentLoaded", typedTextAnimation);
document.addEventListener("DOMContentLoaded", countUpAnimation);
document.addEventListener("DOMContentLoaded", splitText);
document.addEventListener("DOMContentLoaded", commonAnimation);
document.addEventListener("DOMContentLoaded", initTrasnlateY);
document.addEventListener("DOMContentLoaded", initTrasnlateY2);
document.addEventListener("DOMContentLoaded", initTrasnlateX);