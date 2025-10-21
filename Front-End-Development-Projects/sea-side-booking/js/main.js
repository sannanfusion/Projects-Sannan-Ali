// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all functionality
  initTranslations();
  initTheme();
  initNavigation();
  initScrollEffects();
  initBookingForm();
  initComponents();
  initFooter();
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
  }
  
  // Theme toggle functionality
  const themeToggles = document.querySelectorAll('#themeToggle, #themeToggleMobile');
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleTheme);
  });
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Navigation Management
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
  
  // Scroll effect for navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Mobile menu toggle
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      const isActive = mobileMenu.classList.contains('active');
      
      if (isActive) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
    
    // Close mobile menu when clicking overlay
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        closeMobileMenu();
      }
    });
    
    // Close mobile menu when clicking links
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }
  
  // Language selector functionality
  const languageSelectors = document.querySelectorAll('#languageSelect, #languageSelectMobile');
  languageSelectors.forEach(select => {
    select.addEventListener('change', (e) => {
      setLanguage(e.target.value);
      
      // Sync all language selectors
      languageSelectors.forEach(selector => {
        if (selector !== e.target) {
          selector.value = e.target.value;
        }
      });
    });
  });
  
  // Set active navigation link based on current page
  setActiveNavLink();
}

function openMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  
  mobileMenu.classList.add('active');
  mobileMenuToggle.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  
  mobileMenu.classList.remove('active');
  mobileMenuToggle.classList.remove('active');
  document.body.style.overflow = '';
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-menu-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Scroll Effects
function initScrollEffects() {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 100; // Account for fixed navbar
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Fade in animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all elements with fade-in animation
  document.querySelectorAll('.animate-fade-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
  
  // Parallax effect for hero section (if on homepage)
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    initParallax();
  }
}

function initParallax() {
  const heroSection = document.getElementById('hero');
  const heroContent = heroSection.querySelector('.hero-content');
  const heroBg = heroSection.querySelector('.hero-bg');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    const rate = scrollY * -0.5;
    const contentRate = scrollY * -0.2;
    
    if (heroBg) {
      heroBg.style.transform = `translateY(${rate}px)`;
    }
    
    if (heroContent) {
      heroContent.style.transform = `translateY(${contentRate}px)`;
    }
  });
}

// Booking Form
function initBookingForm() {
  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');
  
  if (bookingForm) {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    
    if (checkInInput) {
      checkInInput.setAttribute('min', today);
      
      // Update checkout minimum when checkin changes
      checkInInput.addEventListener('change', () => {
        const checkInDate = new Date(checkInInput.value);
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        if (checkOutInput) {
          checkOutInput.setAttribute('min', nextDay.toISOString().split('T')[0]);
          
          // Clear checkout if it's before the new minimum
          if (checkOutInput.value && new Date(checkOutInput.value) <= checkInDate) {
            checkOutInput.value = '';
          }
        }
      });
    }
    
    // Form submission
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(bookingForm);
      const bookingData = Object.fromEntries(formData);
      
      console.log('Booking Data:', bookingData);
      
      // Show success state
      bookingForm.style.display = 'none';
      if (bookingSuccess) {
        bookingSuccess.classList.remove('hidden');
        
        // Reset form after 3 seconds
        setTimeout(() => {
          bookingForm.style.display = 'flex';
          bookingSuccess.classList.add('hidden');
          bookingForm.reset();
        }, 3000);
      }
    });
  }
  
  // Newsletter form
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = newsletterForm.querySelector('.newsletter-input');
      const submitBtn = newsletterForm.querySelector('.newsletter-btn');
      
      if (emailInput && submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '✓ Subscribed!';
        submitBtn.disabled = true;
        
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          emailInput.value = '';
        }, 2000);
      }
    });
  }
}

// Footer
function initFooter() {
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Error handling
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
});

// Performance monitoring
window.addEventListener('load', () => {
  // Re-initialize Lucide icons after everything is loaded
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Log page load performance
  if ('performance' in window) {
    const loadTime = performance.now();
    console.log(`Page loaded in ${Math.round(loadTime)}ms`);
  }
});

// Resize handler
window.addEventListener('resize', debounce(() => {
  // Close mobile menu on resize to desktop
  if (window.innerWidth >= 768) {
    closeMobileMenu();
  }
}, 250));