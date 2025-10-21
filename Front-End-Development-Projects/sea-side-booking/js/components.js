// Sample data
const apartmentsData = [
  {
    id: "1",
    name: "Deluxe Sea View Suite",
    description: "Luxurious suite with panoramic sea views, modern amenities, and a private balcony.",
    price: 180,
    capacity: 2,
    size: 45,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    location: "Beachfront",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "TV", "Balcony"]
  },
  {
    id: "2",
    name: "Premium Family Apartment",
    description: "Spacious apartment ideal for families, with full kitchen and stunning coastal views.",
    price: 250,
    capacity: 4,
    size: 75,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    location: "Second row",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "TV", "Washing Machine"]
  },
  {
    id: "3",
    name: "Executive Beach Studio",
    description: "Elegant studio with direct beach access, modern design, and premium finishes.",
    price: 150,
    capacity: 2,
    size: 35,
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=600&fit=crop",
    location: "Beachfront",
    features: ["Wi-Fi", "Kitchenette", "Bathroom", "Air Conditioning", "TV"]
  }
];

const testimonialsData = [
  {
    id: 1,
    name: "Sophia Martinez",
    location: "New York, USA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    content: "My family and I had the most wonderful stay at MareSereno. The apartment was immaculate, with breathtaking sea views. The staff went above and beyond to make our vacation special.",
    rating: 5
  },
  {
    id: 2,
    name: "Marco Rossi",
    location: "Rome, Italy",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    content: "Absolutely perfect location, steps away from the beach. The apartment had everything we needed and more. The modern amenities combined with the traditional coastal charm created a truly magical experience.",
    rating: 5
  },
  {
    id: 3,
    name: "Emma Johnson",
    location: "London, UK",
    avatar: "https://images.unsplash.com/photo-1569913486515-b74bf7751574?w=150&h=150&fit=crop&crop=faces",
    content: "We spent a wonderful week at this beachfront paradise. The sunrise views from our terrace were worth the trip alone. Exceptionally clean and beautifully designed spaces.",
    rating: 4
  }
];

// Apartment Card Component
function createApartmentCard(apartment, index) {
  return `
    <div class="apartment-card animate-fade-in" style="animation-delay: ${(index + 1) * 100}ms">
      <div class="apartment-image">
        <img src="${apartment.image}" alt="${apartment.name}" loading="lazy">
        <div class="apartment-overlay">
          <div class="apartment-info">
            <h3 class="apartment-name">${apartment.name}</h3>
            <div class="apartment-location">
              <i data-lucide="map-pin" style="width: 1rem; height: 1rem;"></i>
              <span>${apartment.location}</span>
            </div>
            <div class="apartment-specs">
              <div class="apartment-spec">
                <i data-lucide="users" style="width: 1rem; height: 1rem;"></i>
                <span>${apartment.capacity} ${apartment.capacity === 1 ? t('bookingForm.adult') : t('bookingForm.adults')}</span>
              </div>
              <div class="apartment-spec">
                <i data-lucide="maximize" style="width: 1rem; height: 1rem;"></i>
                <span>${apartment.size} m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="apartment-content">
        <p class="apartment-description">${apartment.description}</p>
        
        <div class="apartment-features">
          ${apartment.features.slice(0, 3).map((feature, i) => `
            <div class="feature-tag">
              ${getFeatureIcon(feature)}
              <span>${feature}</span>
            </div>
          `).join('')}
          ${apartment.features.length > 3 ? `
            <div class="feature-tag">
              <span>+${apartment.features.length - 3} more</span>
            </div>
          ` : ''}
        </div>
        
        <div class="apartment-footer">
          <div class="apartment-price">
            <span class="price-amount">$${apartment.price}</span>
            <span class="price-period">/ night</span>
          </div>
          <a href="apartments.html#${apartment.id}" class="btn btn-primary">
            View Details
          </a>
        </div>
      </div>
    </div>
  `;
}

// Get feature icon
function getFeatureIcon(feature) {
  const iconMap = {
    'Bathroom': '<i data-lucide="bath" style="width: 0.875rem; height: 0.875rem;"></i>',
    'Kitchen': '<i data-lucide="coffee" style="width: 0.875rem; height: 0.875rem;"></i>',
    'Kitchenette': '<i data-lucide="coffee" style="width: 0.875rem; height: 0.875rem;"></i>',
    'Wi-Fi': '<i data-lucide="wifi" style="width: 0.875rem; height: 0.875rem;"></i>',
    'Air Conditioning': '<i data-lucide="wind" style="width: 0.875rem; height: 0.875rem;"></i>',
    'TV': '<i data-lucide="tv" style="width: 0.875rem; height: 0.875rem;"></i>',
    'Balcony': '<i data-lucide="home" style="width: 0.875rem; height: 0.875rem;"></i>',
    'Terrace': '<i data-lucide="home" style="width: 0.875rem; height: 0.875rem;"></i>',
    'Washing Machine': '<i data-lucide="washing-machine" style="width: 0.875rem; height: 0.875rem;"></i>',
    'Jacuzzi': '<i data-lucide="waves" style="width: 0.875rem; height: 0.875rem;"></i>',
    'Mini Fridge': '<i data-lucide="refrigerator" style="width: 0.875rem; height: 0.875rem;"></i>'
  };
  
  return iconMap[feature] || '<i data-lucide="check" style="width: 0.875rem; height: 0.875rem;"></i>';
}

// Testimonial Component
function createTestimonial(testimonial, index, isActive = false) {
  const activeClass = isActive ? 'active' : '';
  
  return `
    <div class="testimonial glass-card ${activeClass}" data-index="${index}">
      <div class="testimonial-content">
        <div class="testimonial-author">
          <div class="author-avatar">
            <img src="${testimonial.avatar}" alt="${testimonial.name}" loading="lazy">
          </div>
          <div class="author-rating">
            ${Array.from({ length: 5 }, (_, i) => `
              <i data-lucide="star" class="star ${i < testimonial.rating ? 'filled' : ''}"></i>
            `).join('')}
          </div>
          <h4 class="author-name">${testimonial.name}</h4>
          <p class="author-location">${testimonial.location}</p>
        </div>
        
        <div class="testimonial-text">
          <blockquote class="testimonial-quote">
            "${testimonial.content}"
          </blockquote>
        </div>
      </div>
    </div>
  `;
}

// Render Apartments
function renderApartments() {
  const apartmentGrid = document.getElementById('apartmentGrid');
  if (apartmentGrid) {
    apartmentGrid.innerHTML = apartmentsData.map((apartment, index) => 
      createApartmentCard(apartment, index)
    ).join('');
    
    // Re-initialize Lucide icons for the new content
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

// Testimonials Slider
let currentTestimonialIndex = 0;
let isTestimonialAnimating = false;

function renderTestimonials() {
  const testimonialTrack = document.getElementById('testimonialTrack');
  const testimonialDots = document.getElementById('testimonialDots');
  
  if (testimonialTrack) {
    testimonialTrack.innerHTML = testimonialsData.map((testimonial, index) => 
      createTestimonial(testimonial, index, index === 0)
    ).join('');
  }
  
  if (testimonialDots) {
    testimonialDots.innerHTML = testimonialsData.map((_, index) => `
      <button class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
    `).join('');
  }
  
  // Re-initialize Lucide icons for the new content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function nextTestimonial() {
  if (isTestimonialAnimating) return;
  
  isTestimonialAnimating = true;
  const newIndex = (currentTestimonialIndex + 1) % testimonialsData.length;
  showTestimonial(newIndex);
  
  setTimeout(() => {
    isTestimonialAnimating = false;
  }, 500);
}

function prevTestimonial() {
  if (isTestimonialAnimating) return;
  
  isTestimonialAnimating = true;
  const newIndex = (currentTestimonialIndex - 1 + testimonialsData.length) % testimonialsData.length;
  showTestimonial(newIndex);
  
  setTimeout(() => {
    isTestimonialAnimating = false;
  }, 500);
}

function showTestimonial(index) {
  const testimonials = document.querySelectorAll('.testimonial');
  const dots = document.querySelectorAll('.testimonial-dots .dot');
  
  // Remove active class from all testimonials and dots
  testimonials.forEach(testimonial => {
    testimonial.classList.remove('active', 'prev');
    if (parseInt(testimonial.dataset.index) < index) {
      testimonial.classList.add('prev');
    }
  });
  
  dots.forEach(dot => dot.classList.remove('active'));
  
  // Add active class to current testimonial and dot
  const currentTestimonial = document.querySelector(`.testimonial[data-index="${index}"]`);
  const currentDot = document.querySelector(`.dot[data-index="${index}"]`);
  
  if (currentTestimonial) currentTestimonial.classList.add('active');
  if (currentDot) currentDot.classList.add('active');
  
  currentTestimonialIndex = index;
}

function initTestimonials() {
  renderTestimonials();
  
  // Auto-advance testimonials
  setInterval(nextTestimonial, 8000);
  
  // Event listeners for navigation
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  
  if (prevBtn) prevBtn.addEventListener('click', prevTestimonial);
  if (nextBtn) nextBtn.addEventListener('click', nextTestimonial);
  
  // Dot navigation
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('dot')) {
      const index = parseInt(e.target.dataset.index);
      if (!isTestimonialAnimating && index !== currentTestimonialIndex) {
        isTestimonialAnimating = true;
        showTestimonial(index);
        setTimeout(() => {
          isTestimonialAnimating = false;
        }, 500);
      }
    }
  });
}

// Initialize components
function initComponents() {
  renderApartments();
  initTestimonials();
}