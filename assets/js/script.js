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
// SECTION OBSERVER (FADE IN) - Otimizado
// ============================================

function initFadeInObserver() {
  // Respeitar preferência de movimento reduzido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Se movimento reduzido, mostrar tudo imediatamente
  if (prefersReducedMotion) {
    const fadeElements = qsa('.fade-up, .fade-in, .fade-bottom');
    fadeElements.forEach(el => el.classList.add('visible'));
    return;
  }
  
  const fadeElements = qsa('.fade-up, .fade-in, .fade-bottom');
  
  if (fadeElements.length === 0) {
    return;
  }
  
  // Configuração otimizada: threshold menor para melhor performance
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px' // Disparar quando 50px antes de entrar na viewport
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Usar requestAnimationFrame para melhor performance
        requestAnimationFrame(() => {
          entry.target.classList.add('visible');
        });
        // Unobserve após ativar para melhor performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observar todos os elementos de uma vez
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

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateHeight(panel, targetHeight, callback) {
    function handler(event) {
      if (event.propertyName === 'height') {
        panel.removeEventListener('transitionend', handler);
        if (typeof callback === 'function') {
          callback();
        }
      }
    }
    panel.addEventListener('transitionend', handler);
    requestAnimationFrame(() => {
      panel.style.height = targetHeight;
    });
  }

  function openItem(item, animate = true) {
    const panel = item.querySelector('dd');
    if (!panel) return;

    item.classList.add('open');
    const targetHeight = `${panel.scrollHeight}px`;

    if (!animate || prefersReducedMotion) {
      panel.style.height = 'auto';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
      return;
    }

    panel.style.height = '0px';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(-6px)';

    animateHeight(panel, targetHeight, () => {
      panel.style.height = 'auto';
    });

    requestAnimationFrame(() => {
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    });
  }

  function closeItem(item, animate = true) {
    if (!item.classList.contains('open')) return;
    const panel = item.querySelector('dd');
    if (!panel) return;

    const currentHeight = panel.scrollHeight;
    item.classList.remove('open');

    if (!animate || prefersReducedMotion) {
      panel.style.height = '0px';
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-6px)';
      return;
    }

    panel.style.height = `${currentHeight}px`;
    animateHeight(panel, '0px', () => {
      panel.style.height = '0px';
    });

    requestAnimationFrame(() => {
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-6px)';
    });
  }

  items.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('dd');
    if (!trigger || !panel) return;

    if (item.classList.contains('open')) {
      panel.style.height = 'auto';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
      trigger.setAttribute('aria-expanded', 'true');
    } else {
      panel.style.height = '0px';
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-6px)';
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach((accord) => {
        if (accord === item) {
          if (isOpen) {
            closeItem(accord);
          } else {
            openItem(accord);
          }
        } else {
          closeItem(accord);
        }
        const accordTrigger = accord.querySelector('.faq-trigger');
        if (accordTrigger) {
          accordTrigger.setAttribute('aria-expanded', accord.classList.contains('open'));
        }
      });
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

  const aporteInicialInput = form.querySelector('#micro-aporte-inicial');
  const aporteMensalInput = form.querySelector('#micro-aporte');
  const annualField = form.querySelector('[data-micro-annual]');
  const incomeField = form.querySelector('[data-micro-income]');

  if (!aporteInicialInput || !aporteMensalInput || !annualField || !incomeField) {
    return;
  }

  // Premissas fixas conforme especificação
  const TAXA_JUROS_MENSAL = 0.009; // 0,9% ao mês
  const PRAZO_MESES = 12;
  const TAXA_SAQUE_MENSAL = 0.004; // 0,4% ao mês

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2
  });

  function calcularPatrimonioProjetado(valorAporteInicial, aporteMensal) {
    // Fórmula: Patrimônio_Final = PV * (1 + i)^n + PMT * [((1 + i)^n - 1) / i]
    // Onde:
    // PV = valor_aporte_inicial
    // i = taxa_juros_mensal
    // n = prazo_meses
    // PMT = aporte_mensal

    const PV = valorAporteInicial;
    const i = TAXA_JUROS_MENSAL;
    const n = PRAZO_MESES;
    const PMT = aporteMensal;

    // Calcular (1 + i)^n
    const fatorCrescimento = Math.pow(1 + i, n);

    // Primeira parte: PV * (1 + i)^n
    const valorInicialCrescido = PV * fatorCrescimento;

    // Segunda parte: PMT * [((1 + i)^n - 1) / i]
    const valorAportesCrescido = PMT * ((fatorCrescimento - 1) / i);

    // Patrimônio final
    const patrimonioFinal = valorInicialCrescido + valorAportesCrescido;

    return patrimonioFinal;
  }

  function calcularRendaMensal(patrimonioProjetado) {
    // Renda_Mensal_Estimada = Patrimônio_Final * taxa_saque_mensal
    return patrimonioProjetado * TAXA_SAQUE_MENSAL;
  }

  function updateResults() {
    // Obter valores dos inputs
    const valorAporteInicial = Number(aporteInicialInput.value) || 0;
    const aporteMensal = Number(aporteMensalInput.value) || 0;

    // Validar valores mínimos
    if (valorAporteInicial < 0 || aporteMensal < 0) {
      annualField.textContent = currencyFormatter.format(0);
      incomeField.textContent = currencyFormatter.format(0);
      return;
    }

    // Calcular patrimônio projetado em 12 meses
    const patrimonioProjetado = calcularPatrimonioProjetado(valorAporteInicial, aporteMensal);

    // Calcular renda mensal estimada
    const rendaMensal = calcularRendaMensal(patrimonioProjetado);

    // Atualizar campos de resultado
    annualField.textContent = currencyFormatter.format(patrimonioProjetado);
    incomeField.textContent = currencyFormatter.format(rendaMensal);
  }

  // Atualizar resultados em tempo real durante digitação
  aporteInicialInput.addEventListener('input', updateResults);
  aporteMensalInput.addEventListener('input', updateResults);

  // Validar no submit
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateResults();
  });

  // Inicializar com valores padrão
  updateResults();
}

// ============================================
// PLANOS ANIMATION
// ============================================
// Removida função específica - seção usa fade-up padrão do initFadeInObserver

// ============================================
// UNIFIED ANIMATION OBSERVER (Otimizado)
// ============================================

// Observer unificado para todas as animações com .animate-in
function initUnifiedAnimationObserver() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Configurações de animação por seção
  const animationConfigs = [
    {
      section: '.aurum-patrimonial',
      header: '.aurum-patrimonial-header',
      items: '.aurum-card',
      stagger: 100,
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    },
    {
      section: '.faq-section',
      header: '.faq-intro',
      items: '.faq-item',
      accordion: '.faq-accordion',
      stagger: 50,
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    },
    {
      section: '.final-cta',
      header: '.cta-title',
      items: '.btn-cta',
      stagger: 200,
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    },
    {
      section: '.site-footer',
      header: '.footer-content',
      items: '.footer-bottom',
      stagger: 200,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  ];
  
  // Função para animar elementos com stagger otimizado
  function animateWithStagger(elements, delay = 0, stagger = 0) {
    if (!elements || elements.length === 0) return;
    
    elements.forEach((el, index) => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.classList.add('animate-in');
        }, delay + (index * stagger));
      });
    });
  }
  
  // Processar cada configuração
  animationConfigs.forEach(config => {
    const section = qs(config.section);
    if (!section) return;
    
    const header = config.header ? qs(config.header, section) : null;
    const items = config.items ? qsa(config.items, section) : [];
    const accordion = config.accordion ? qs(config.accordion, section) : null;
    
    // Se preferência de movimento reduzido, aplicar imediatamente
    if (prefersReducedMotion) {
      if (header) header.classList.add('animate-in');
      if (accordion) accordion.classList.add('animate-in');
      items.forEach(item => item.classList.add('animate-in'));
      return;
    }
    
    // Criar observer para esta seção
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animar header primeiro
          if (header) {
            requestAnimationFrame(() => {
              header.classList.add('animate-in');
            });
          }
          
          // Animar accordion (se existir)
          if (accordion) {
            requestAnimationFrame(() => {
              setTimeout(() => {
                accordion.classList.add('animate-in');
              }, 200);
            });
          }
          
          // Animar items com stagger
          if (items.length > 0) {
            animateWithStagger(items, config.stagger, config.stagger);
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    });
    
    observer.observe(section);
  });
}

// Observer unificado - inicializado apenas uma vez
let unifiedObserverInitialized = false;

// Funções de compatibilidade (mantidas para não quebrar código existente)
function initAurumPatrimonialAnimation() {
  if (!unifiedObserverInitialized) {
    initUnifiedAnimationObserver();
    unifiedObserverInitialized = true;
  }
}

function initFAQAnimation() {
  if (!unifiedObserverInitialized) {
    initUnifiedAnimationObserver();
    unifiedObserverInitialized = true;
  }
}

function initFinalCTAAnimation() {
  if (!unifiedObserverInitialized) {
    initUnifiedAnimationObserver();
    unifiedObserverInitialized = true;
  }
}

function initFooterAnimation() {
  if (!unifiedObserverInitialized) {
    initUnifiedAnimationObserver();
    unifiedObserverInitialized = true;
  }
}

// ============================================
// FORMULÁRIO DE CONTATO
// ============================================

function initContatoForm() {
  const form = qs('#form-contato');
  if (!form) return;

  const temMaquinasRadios = form.querySelectorAll('input[name="tem_maquinas"]');
  const maquinasGroup = qs('#maquinas-group');

  if (!temMaquinasRadios || !maquinasGroup) return;

  // Mostrar/ocultar campo de máquinas
  temMaquinasRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'sim' && radio.checked) {
        maquinasGroup.style.display = 'flex';
      } else {
        maquinasGroup.style.display = 'none';
      }
    });
  });

  // Validação básica no submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    console.log('Dados do formulário:', data);
    
    // Aqui você pode adicionar lógica para enviar para um backend
    alert('Formulário enviado com sucesso! Entraremos em contato em breve.');
    form.reset();
    maquinasGroup.style.display = 'none';
  });
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
  // Desabilitar completamente no mobile para melhor performance
  if (window.innerWidth <= 768) {
    return;
  }
  
  // Aguardar ScrollTrigger estar pronto
  if (typeof ScrollTrigger === 'undefined' || typeof gsap === 'undefined') {
    return;
  }

  // Função para processar triggers (executada uma vez após delay)
  function processTriggers() {
    ScrollTrigger.refresh();
    const triggers = ScrollTrigger.getAll();
    
    triggers.forEach(trigger => {
      if (trigger?.trigger) {
        const element = trigger.trigger;
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
        
        if (isVisible) {
          // Completar animações que ainda não iniciaram
          if (trigger.animation?.progress() === 0) {
            trigger.animation.progress(1);
          }
        }
      }
    });
  }

  // Verificar apenas uma vez após carregamento (consolidado)
  setTimeout(processTriggers, 500);
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
  initContatoForm();
  initBackToTop();
  
  // Inicializar observer unificado uma única vez (otimizado)
  initUnifiedAnimationObserver();
  
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

// Verificar após carregamento completo (apenas desktop)
window.addEventListener('load', () => {
  if (window.innerWidth > 768) {
    checkAndCompleteVisibleAnimations();
  }
});
