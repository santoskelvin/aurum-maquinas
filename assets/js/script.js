

const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
  const links = qsa('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Ignorar links vazios ou apenas "#"
      if (href === '#' || href === '') {
        return;
      }
      
      const target = qs(href);
      
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ============================================
// SECTION OBSERVER (FADE IN)
// ============================================

function initFadeInObserver() {
  const fadeElements = qsa('.fade-in, .fade-up, .fade-bottom');
  
  if (fadeElements.length === 0) {
    return;
  }
  
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve após ativar para melhor performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  fadeElements.forEach(element => {
    observer.observe(element);
  });
}

// ============================================
// HEADER BEHAVIOR
// ============================================

function initHeaderBehavior() {
  const header = qs('header');
  
  if (!header) {
    return;
  }
  
  let ticking = false;
  
  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        
        if (scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        
        ticking = false;
      });
      
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Verificar estado inicial
  handleScroll();
}

// ============================================
// INIT FUNCTION
// ============================================

function init() {
  initSmoothScroll();
  initFadeInObserver();
  initHeaderBehavior();
}

// ============================================
// DOM READY
// ============================================

document.addEventListener('DOMContentLoaded', init);


