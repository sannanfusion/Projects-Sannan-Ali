const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

function debounce(fn, wait = 100) {
  let t;
  return function (...a) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, a), wait);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = qs('.mobile-toggle');
  const siteNav = qs('.main-nav');
  if (mobileToggle && siteNav) {
    on(mobileToggle, 'click', () => {
      siteNav.classList.toggle('open');
      mobileToggle.classList.toggle('open');
      const expanded = mobileToggle.getAttribute('aria-expanded') !== 'true';
      mobileToggle.setAttribute('aria-expanded', expanded);
    });
  }

  qsa('.main-nav .has-dropdown').forEach(li => {
    const link = qs('a', li);
    link.setAttribute('aria-haspopup', 'true');
    on(li, 'mouseenter', () => {
      if (window.innerWidth > 980) li.classList.add('open');
    });
    on(li, 'mouseleave', () => {
      if (window.innerWidth > 980) li.classList.remove('open');
    });
    on(link, 'click', (e) => {
      if (window.innerWidth <= 980) {
        e.preventDefault();
        li.classList.toggle('open');
      }
    });
    on(link, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        li.classList.toggle('open');
      }
    });
  });

  const header = qs('.main-header') || qs('header');
  if (header) {
    const onScrollHeader = debounce(() => {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }, 15);
    on(window, 'scroll', onScrollHeader);
    onScrollHeader();
  }

  const counters = qsa('.counter');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const isInt = Number.isInteger(target);
        const duration = 1400;
        const fps = 60;
        const totalFrames = Math.round((duration / 1000) * fps);
        let frame = 0;
        const start = 0;
        const step = target / totalFrames;
        const formatNumber = (n) => isInt ? Math.round(n) : Number(n.toFixed(1));
        const loop = () => {
          frame++;
          const val = Math.min(target, start + step * frame);
          el.textContent = formatNumber(val);
          if (frame < totalFrames && val < target) {
            requestAnimationFrame(loop);
          } else {
            el.textContent = formatNumber(target);
          }
        };
        loop();
        obs.unobserve(el);
      });
    }, { threshold: 0.8 });

    counters.forEach(c => {
      c.textContent = '0';
      counterObserver.observe(c);
    });
  }

  const faqItems = qsa('.faq-item');
  if (faqItems.length) {
    const ONE_OPEN = false;
    faqItems.forEach(item => {
      const btn = qs('.faq-question', item);
      const ans = qs('.faq-answer', item);
      if (btn && ans) {
        btn.setAttribute('aria-expanded', 'false');
        on(btn, 'click', () => {
          const isActive = item.classList.contains('active');
          if (ONE_OPEN) {
            faqItems.forEach(i => {
              i.classList.remove('active');
              const b = qs('.faq-question', i);
              if (b) b.setAttribute('aria-expanded', 'false');
            });
          }
          if (!isActive) {
            item.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
          } else {
            item.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  }

  const pricingCards = qsa('.pricing-card');
  if (pricingCards.length) {
    pricingCards.forEach(card => {
      on(card, 'click', () => {
        pricingCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      });
    });
  }

  qsa('a[href^="#"]').forEach(a => {
    on(a, 'click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href === '') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  qsa('form.newsletter').forEach(form => {
    const input = qs('input[type="email"]', form);
    on(form, 'submit', (e) => {
      e.preventDefault();
      if (!input) return;
      const email = input.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      if (!ok) {
        input.classList.add('invalid');
        input.focus();
        let msg = qs('.newsletter-msg', form);
        if (!msg) {
          msg = document.createElement('div');
          msg.className = 'newsletter-msg';
          msg.style.color = '#ffdddd';
          msg.style.marginTop = '8px';
          form.appendChild(msg);
        }
        msg.textContent = 'Please enter a valid email address.';
        return;
      }
      input.value = '';
      let msg = qs('.newsletter-msg', form);
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'newsletter-msg';
        msg.style.color = '#cfeedd';
        msg.style.marginTop = '8px';
        form.appendChild(msg);
      }
      msg.textContent = 'Thanks! You are subscribed.';
    });
  });

  if (!('loading' in HTMLImageElement.prototype)) {
    qsa('img[data-src]').forEach(img => {
      img.src = img.getAttribute('data-src');
    });
  }

  on(document, 'click', (e) => {
    qsa('.main-nav .has-dropdown.open').forEach(openItem => {
      if (!openItem.contains(e.target)) openItem.classList.remove('open');
    });
  });

  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') {
      qsa('.main-nav .has-dropdown.open').forEach(i => i.classList.remove('open'));
      faqItems.forEach(i => i.classList.remove('active'));
    }
  });
});
