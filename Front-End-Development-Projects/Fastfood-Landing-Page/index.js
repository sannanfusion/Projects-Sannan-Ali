document.addEventListener('DOMContentLoaded', function() {
    // Mobile hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            // aria-expanded must be a string "true"/"false"
            this.setAttribute('aria-expanded', this.classList.contains('active') ? 'true' : 'false');
        });
    }

    // Sticky header with shadow on Scroll
    const header = document.getElementById('header');

    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Testimonial slider functionality
    const testimonialSlider = document.querySelector('.testimonials-slider');
    const testimonials = document.querySelectorAll('.testimonial');
    const prevButton = document.querySelector('.testimonial-prev');
    const nextButton = document.querySelector('.testimonial-next');
    let currentIndex = 0;
    let autoSlideInterval;

    function updateSlider() {
        if (testimonialSlider) {
            testimonialSlider.style.transform = `translateX(-${currentIndex * 100}%)`;
            // update aria-live or active classes if needed
            testimonials.forEach((t, i) => {
                t.setAttribute('aria-hidden', i === currentIndex ? 'false' : 'true');
            });
        }
    }

    function nextSlide() {
        if (!testimonials.length) return;
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateSlider();
    }

    function prevSlide() {
        if (!testimonials.length) return;
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        updateSlider();
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 8000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    if (nextButton) {
        nextButton.addEventListener('click', function() {
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
            nextButton.focus();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function() {
            stopAutoSlide();
            prevSlide();
            startAutoSlide();
            prevButton.focus();
        });
    }

    // Start auto sliding if there are testimonials
    if (testimonials.length && testimonialSlider) {
        // Set initial aria-hidden attributes
        testimonials.forEach((t, i) => t.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'));
        updateSlider();
        startAutoSlide();
    }

    // Pause auto slide when hovering over testimonials
    const testimonialsContainer = document.querySelector('.testimonials-container');
    if (testimonialsContainer) {
        testimonialsContainer.addEventListener('mouseenter', stopAutoSlide);
        testimonialsContainer.addEventListener('mouseleave', startAutoSlide);
    }

    // Keyboard support for testimonial slider (Left / Right)
    document.addEventListener('keydown', function(e) {
        // ignore if focus is in an input or textarea
        const tag = document.activeElement && document.activeElement.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;

        if (e.key === 'ArrowRight') {
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
        } else if (e.key === 'ArrowLeft') {
            stopAutoSlide();
            prevSlide();
            startAutoSlide();
        }
    });

    // Form validation
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            let isValid = true;

            // Reset previous error states
            document.querySelectorAll('.form-input').forEach(input => {
                input.classList.remove('error');
                input.removeAttribute('aria-invalid');
            });

            // Validate name
            if (!nameInput || !nameInput.value.trim()) {
                if (nameInput) {
                    nameInput.classList.add('error');
                    nameInput.setAttribute('aria-invalid', 'true');
                }
                isValid = false;
            }

            // Validate email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput || !emailPattern.test(emailInput.value)) {
                if (emailInput) {
                    emailInput.classList.add('error');
                    emailInput.setAttribute('aria-invalid', 'true');
                }
                isValid = false;
            }

            // Validate message
            if (!messageInput || !messageInput.value.trim()) {
                if (messageInput) {
                    messageInput.classList.add('error');
                    messageInput.setAttribute('aria-invalid', 'true');
                }
                isValid = false;
            }

            if (isValid) {
                // Form is valid, you would normally submit it here (e.g., AJAX)
                // For demo: show accessible success message
                const successMsg = document.createElement('div');
                successMsg.className = 'form-success';
                successMsg.setAttribute('role', 'status');
                successMsg.textContent = 'Thank you for your message! We will get back to you soon.';
                contactForm.prepend(successMsg);

                // Remove success message after a while
                setTimeout(() => {
                    if (successMsg && successMsg.parentNode) successMsg.parentNode.removeChild(successMsg);
                }, 5000);

                contactForm.reset();
            } else {
                // Focus the first invalid field
                const firstError = contactForm.querySelector('.error');
                if (firstError) firstError.focus();
                alert('Please fill in all fields correctly.');
            }
        });
    }

    // Fade-in animation on scroll
    const fadeElements = document.querySelectorAll('.fade-in');

    function checkFade() {
        fadeElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = (rect.top < window.innerHeight - 100) && (rect.bottom > 0);
            if (isVisible) {
                element.classList.add('visible');
            }
        });
    }

    // Check on load and scroll
    checkFade();
    window.addEventListener('scroll', checkFade);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Close mobile menu if open
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }

                // Smooth scroll
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Accessibility: Allow Enter/Space to toggle hamburger when focused
    if (hamburger) {
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }

    // Respect prefers-reduced-motion for auto slide
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        stopAutoSlide();
    }
});
