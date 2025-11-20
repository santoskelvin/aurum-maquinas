

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
// HEADER BEHAVIOR (Sticky + Shrink)
// ============================================

function initHeaderBehavior() {
  const header = qs('.site-header');
  
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
// HERO PARALLAX EFFECT
// ============================================

function initHeroParallax() {
  const heroBg = qs('.hero-bg-image');
  
  if (!heroBg) {
    return;
  }
  
  // Desabilitar completamente no mobile para evitar problemas de scroll
  if (window.innerWidth <= 768) {
    heroBg.style.transform = 'translateY(0px)';
    return;
  }
  
  // Respeitar preferência de movimento reduzido
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  let ticking = false;
  
  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const heroSection = qs('.hero');
        
        if (!heroSection) {
          ticking = false;
          return;
        }
        
        const heroRect = heroSection.getBoundingClientRect();
        const isVisible = heroRect.top < window.innerHeight && heroRect.bottom > 0;
        
        if (isVisible) {
          // Calcular o deslocamento baseado na posição do scroll
          // Movimento suave e sutil (até 30px)
          const scrollProgress = Math.max(0, Math.min(1, -heroRect.top / (heroRect.height + window.innerHeight)));
          const parallaxOffset = scrollProgress * 30;
          
          heroBg.style.transform = `translateY(${parallaxOffset}px)`;
        } else if (heroRect.bottom < 0) {
          // Reset quando a hero section está completamente acima da viewport
          heroBg.style.transform = 'translateY(0px)';
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
// MOBILE NAVIGATION TOGGLE
// ============================================

function initMobileNav() {
  const navToggle = qs('.nav-toggle');
  const navClose = qs('.nav-close');
  const mainNav = qs('.main-nav');
  const navOverlay = qs('.nav-overlay');
  
  if (!navToggle || !mainNav) {
    return;
  }
  
  // Função para fechar o menu
  function closeMenu() {
    mainNav.classList.remove('open');
    if (navOverlay) {
      navOverlay.classList.remove('active');
    }
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu');
    }
    // Restaurar scroll do body quando menu está fechado
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Restaurar posição do scroll se foi salva
    const scrollY = document.body.style.top;
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }
  
  // Função para abrir o menu
  function openMenu() {
    // Salvar posição atual do scroll
    const scrollY = window.scrollY;
    
    mainNav.classList.add('open');
    if (navOverlay) {
      navOverlay.classList.add('active');
    }
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Fechar menu');
    }
    
    // Prevenir scroll do body quando menu está aberto (técnica melhorada)
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }
  
  // Toggle do botão hamburger
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.contains('open');
    
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });
  
  // Botão de fechar dentro do menu
  if (navClose) {
    navClose.addEventListener('click', () => {
      closeMenu();
    });
  }
  
  // Fechar menu ao clicar no overlay
  if (navOverlay) {
    navOverlay.addEventListener('click', () => {
      closeMenu();
    });
  }
  
  // Fechar menu ao clicar em um link
  const navLinks = qsa('.nav-list a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
  
  // Fechar menu ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      closeMenu();
      if (navToggle) {
        navToggle.focus();
      }
    }
  });
}

// ============================================
// HERO ANIMATIONS (Hierarchical Loading + Counter)
// ============================================

function initHeroAnimations() {
  const heroSection = qs('.hero');
  if (!heroSection) return;
  
  // Respeitar preferência de movimento reduzido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Animar elementos hierarquicamente
  const animateItems = qsa('.hero-animate-item');
  
  if (animateItems.length === 0) return;
  
  // Função para animar um item
  function animateItem(item, delay) {
    setTimeout(() => {
      item.classList.add('visible');
    }, delay * 1000);
  }
  
  // Animar todos os itens com seus delays
  animateItems.forEach(item => {
    const delay = parseFloat(item.getAttribute('data-animate-delay')) || 0;
    animateItem(item, delay);
  });
  
  // Animar contadores de números
  function animateCounter(element, target, duration = 2000) {
    if (prefersReducedMotion) {
      element.textContent = target;
      return;
    }
    
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const start = 0;
    const startTime = performance.now();
    
    // Adicionar classe de animação
    element.classList.add('animating');
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      // Formatar o valor
      let displayValue = current.toString();
      
      // Adicionar prefixo/sufixo se necessário
      if (prefix && suffix) {
        displayValue = `${prefix}${displayValue}${suffix}`;
      } else if (prefix) {
        displayValue = `${prefix}${displayValue}`;
      } else if (suffix) {
        displayValue = `${displayValue}${suffix}`;
      } else {
        displayValue = current.toString();
      }
      
      element.textContent = displayValue;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Garantir valor final exato
        let finalValue = target.toString();
        if (prefix && suffix) {
          finalValue = `${prefix}${finalValue}${suffix}`;
        } else if (prefix) {
          finalValue = `${prefix}${finalValue}`;
        } else if (suffix) {
          finalValue = `${finalValue}${suffix}`;
        } else {
          finalValue = target.toString();
        }
        element.textContent = finalValue;
        element.classList.remove('animating');
      }
    }
    
    requestAnimationFrame(update);
  }
  
  // Iniciar animação dos contadores após um delay
  setTimeout(() => {
    const metricValues = qsa('.hero-metric-value[data-target]');
    metricValues.forEach((element, index) => {
      const target = parseInt(element.getAttribute('data-target'));
      const delay = index * 200; // Delay escalonado entre os números
      
      setTimeout(() => {
        animateCounter(element, target);
      }, delay);
    });
  }, 800); // Iniciar após as animações de texto começarem
}

// ============================================
// FAQ ACCORDION
// ============================================

function initFAQAccordion() {
  const items = qsa('.faq-item');
  if (items.length === 0) return;

  function setState(item, shouldOpen) {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('dd');
    if (!trigger || !panel) return;

    if (shouldOpen) {
      // Abrir: primeiro remover classe, calcular altura, depois adicionar classe e animar
      item.classList.remove('open');
      panel.style.maxHeight = 'none';
      const height = panel.scrollHeight;
      panel.style.maxHeight = '0px';
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      
      requestAnimationFrame(() => {
        panel.style.maxHeight = `${height}px`;
      });
    } else {
      // Fechar: animar para 0
      const height = panel.scrollHeight;
      panel.style.maxHeight = `${height}px`;
      item.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      
      requestAnimationFrame(() => {
        panel.style.maxHeight = '0px';
      });
    }
  }

  items.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('dd');
    if (!trigger || !panel) return;

    // Initialize heights for existing state
    const isOpen = item.classList.contains('open');
    if (isOpen) {
      const panel = item.querySelector('dd');
      if (panel) {
        panel.style.maxHeight = 'none';
        const height = panel.scrollHeight;
        panel.style.maxHeight = `${height}px`;
        panel.style.opacity = '1';
      }
    }

    trigger.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      items.forEach((accord) => setState(accord, accord === item ? willOpen : false));
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        trigger.click();
      }
    });
  });
}

// ============================================
// MICRO CALCULATOR
// ============================================

function initMicroCalculator() {
  const form = qs('[data-microcalc]');
  if (!form) return;

  const input = form.querySelector('input[type="number"]');
  const annualField = form.querySelector('[data-micro-annual]');
  const incomeField = form.querySelector('[data-micro-income]');

  if (!input || !annualField || !incomeField) {
    return;
  }

  const MULTIPLICADOR = 2.8;
  const RENTABILIDADE = 0.18;
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2
  });

  function clampValue(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return 0;
    return Math.min(20000, Math.max(200, numeric));
  }

  function updateResults() {
    const aporteMensal = clampValue(input.value || input.getAttribute('value') || 0);
    input.value = aporteMensal;

    const patrimonio = aporteMensal * MULTIPLICADOR * 12;
    const rendaMensal = (patrimonio * RENTABILIDADE) / 12;

    annualField.textContent = currencyFormatter.format(patrimonio);
    incomeField.textContent = currencyFormatter.format(rendaMensal);
  }

  input.addEventListener('input', updateResults);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateResults();
  });

  updateResults();
}

// ============================================
// INIT FUNCTION
// ============================================

// ============================================
// BACK TO TOP BUTTON
// ============================================

function initBackToTop() {
  const backToTopBtn = qs('#back-to-top');
  if (!backToTopBtn) return;

  // Mostrar/esconder botão baseado no scroll
  function handleScroll() {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // Scroll suave ao clicar
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Verificar scroll inicial e adicionar listener
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

// ============================================
// VERIFICAR E COMPLETAR ANIMAÇÕES SE JÁ VISÍVEIS
// ============================================

function checkAndCompleteVisibleAnimations() {
  // Desabilitar no mobile para melhor performance
  if (window.innerWidth <= 768) {
    return;
  }
  
  // Aguardar ScrollTrigger estar pronto
  if (typeof ScrollTrigger === 'undefined' || typeof gsap === 'undefined') {
    return;
  }

  // Função auxiliar para verificar visibilidade (compatível com mobile)
  function isElementVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    // Usar visualViewport se disponível (melhor para mobile)
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    
    // Verificar se o elemento está visível na viewport
    // No mobile, ser mais permissivo (threshold maior)
    const threshold = window.innerWidth <= 768 ? 0.9 : 0.8;
    
    return (
      rect.top < viewportHeight * threshold &&
      rect.bottom > 0 &&
      rect.left < viewportWidth &&
      rect.right > 0
    );
  }

  // Função para processar triggers
  function processTriggers() {
    ScrollTrigger.refresh();
    
    // Obter todos os ScrollTriggers ativos
    const triggers = ScrollTrigger.getAll();
    
    triggers.forEach(trigger => {
      if (trigger && trigger.trigger) {
        const element = trigger.trigger;
        
        if (isElementVisible(element)) {
          // Verificar se há animação associada
          if (trigger.animation) {
            const anim = trigger.animation;
            if (anim && anim.progress() === 0) {
              anim.progress(1);
            }
          }
          
          // Também verificar timelines
          if (trigger.vars && trigger.vars.animation) {
            const anim = trigger.vars.animation;
            if (anim && anim.progress && anim.progress() === 0) {
              anim.progress(1);
            }
          }
          
          // Forçar elementos filhos a ficarem visíveis (fallback para mobile)
          const animatedChildren = element.querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"]');
          animatedChildren.forEach(child => {
            if (isElementVisible(child)) {
              gsap.set(child, { opacity: 1, visibility: 'visible' });
            }
          });
        }
      }
    });
    
    // Fallback adicional: garantir que seções visíveis tenham conteúdo visível
    if (window.innerWidth <= 768) {
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        if (isElementVisible(section)) {
          // Garantir que elementos animados dentro da seção estejam visíveis
          const animatedElements = section.querySelectorAll('.fade-up, .fade-in, .fade-bottom');
          animatedElements.forEach(el => {
            if (isElementVisible(el)) {
              gsap.set(el, { opacity: 1, visibility: 'visible', y: 0, x: 0 });
            }
          });
        }
      });
    }
  }

  // Verificar múltiplas vezes para garantir (especialmente importante no mobile)
  setTimeout(processTriggers, 100);
  setTimeout(processTriggers, 300);
  setTimeout(processTriggers, 600);
  setTimeout(processTriggers, 1000);
  
  // No mobile, também verificar após resize/orientation change
  if (window.innerWidth <= 768) {
    window.addEventListener('resize', processTriggers, { once: true, passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(processTriggers, 200);
    }, { once: true, passive: true });
  }
}

// Prevenir scroll horizontal
function preventHorizontalScroll() {
  // Garantir que não há scroll horizontal (apenas no CSS, não forçar via JS)
  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
  
  // Remover a verificação periódica que estava causando problemas
  // A propriedade overflow-x: hidden no CSS é suficiente
}

function init() {
  preventHorizontalScroll();
  initSmoothScroll();
  initFadeInObserver();
  initHeaderBehavior();
  initMobileNav();
  initHeroParallax();
  initHeroAnimations();
  initFAQAccordion();
  initMicroCalculator();
  initBackToTop();
  
  // Verificar e completar animações se elementos já estão visíveis
  checkAndCompleteVisibleAnimations();
}

// ============================================
// DOM READY
// ============================================

// Aguardar página estar completamente carregada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Verificar novamente após todas as animações serem inicializadas
window.addEventListener('load', () => {
  setTimeout(() => {
    checkAndCompleteVisibleAnimations();
  }, 300);
});

// Verificar também quando a página é restaurada com scroll
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Página foi restaurada do cache
    setTimeout(() => {
      checkAndCompleteVisibleAnimations();
    }, 100);
  }
});

// No mobile, verificar após o viewport estabilizar (importante para navegadores mobile)
if (window.innerWidth <= 768) {
  // Aguardar viewport estabilizar (especialmente importante para navegadores mobile com barra de endereço)
  let viewportStable = false;
  let lastHeight = window.innerHeight;
  
  function checkViewportStable() {
    const currentHeight = window.innerHeight;
    if (Math.abs(currentHeight - lastHeight) < 5) {
      if (!viewportStable) {
        viewportStable = true;
        setTimeout(() => {
          checkAndCompleteVisibleAnimations();
        }, 200);
      }
    } else {
      lastHeight = currentHeight;
      viewportStable = false;
    }
  }
  
  // Verificar viewport a cada 100ms por até 2 segundos
  let checkCount = 0;
  const viewportCheck = setInterval(() => {
    checkViewportStable();
    checkCount++;
    if (checkCount >= 20 || viewportStable) {
      clearInterval(viewportCheck);
    }
  }, 100);
  
  // Também verificar quando o scroll para (mobile pode ter scroll inicial)
  let scrollTimeout;
  const scrollHandler = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      checkAndCompleteVisibleAnimations();
    }, 150);
  };
  window.addEventListener('scroll', scrollHandler, { passive: true });
}


