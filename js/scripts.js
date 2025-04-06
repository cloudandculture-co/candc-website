// Wait for the document to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // Initialize the navbar scroll effect
    initNavbarScroll();
    
    // Initialize smooth scrolling for anchor links
    initSmoothScroll();
    
    // Initialize carousel touch swipe
    initCarouselSwipe();
});

// Function to handle navbar transparency/color change on scroll
function initNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    
    // Check initial scroll position (in case the page is refreshed scrolled down)
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    }
    
    window.addEventListener('scroll', function() {
        // If scroll position is greater than 50px, add scrolled class
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

// Function to handle smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#" (no target)
            if (targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Get navbar height for offset
                const navbarHeight = document.getElementById('mainNav').offsetHeight;
                
                // Calculate scroll position
                const scrollPosition = targetElement.offsetTop - navbarHeight;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
                
                // Update active state in navbar
                document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Don't add active class to buttons
                if (!this.classList.contains('btn')) {
                    this.classList.add('active');
                }
            }
        });
    });
}

// Function to update active navigation link based on scroll position
function updateActiveNavOnScroll() {
    const scrollPosition = window.scrollY;
    const navbarHeight = document.getElementById('mainNav').offsetHeight;
    
    // Get all sections with IDs
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navbarHeight - 100; // Offset for earlier activation
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
                link.classList.remove('active');
                // Don't add active class to buttons
                if (!link.classList.contains('btn') && link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Function to enable touch swipe on carousel for mobile
function initCarouselSwipe() {
    const carousel = document.querySelector('#heroCarousel');
    
    if (!carousel) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const carouselInstance = new bootstrap.Carousel(carousel);
        
        if (touchEndX < touchStartX - 50) {
            // Swipe left, go to next slide
            carouselInstance.next();
        }
        
        if (touchEndX > touchStartX + 50) {
            // Swipe right, go to previous slide
            carouselInstance.prev();
        }
    }
}

// When the page loads, set the active nav link based on scroll position
window.addEventListener('load', function() {
    updateActiveNavOnScroll();
    window.addEventListener('scroll', updateActiveNavOnScroll);
    
    // Add preloader if needed
    setTimeout(function() {
        document.body.classList.add('loaded');
    }, 300);
});

// Refresh AOS animations when window is resized
window.addEventListener('resize', function() {
    AOS.refresh();
});

// Add parallax effect to carousel
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop < window.innerHeight) {
        document.querySelectorAll('.carousel-item .placeholder-image').forEach(img => {
            img.style.transform = 'translateY(' + scrollTop * 0.3 + 'px)';
        });
    }
});