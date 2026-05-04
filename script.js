// ========== GSAP SETUP ==========
gsap.registerPlugin(ScrollTrigger);

// ========== GLOBAL STATE ==========
const PAGES = ['home', 'about', 'works', 'contact'];
let currentPage = 'home';
let scrollTriggers = [];
let audioPlaying = false;
let isAnimating = false;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  initTime();
  initNavbar();
  buildRevealText();
  
  setTimeout(() => {
    hideLoader();
    initPage('home');
    ScrollTrigger.refresh();
  }, 2700);

  const hash = location.hash.replace('#', '') || 'home';
  if (PAGES.includes(hash) && hash !== 'home') {
    setTimeout(() => goToPage(hash), 2800);
  }
});

window.addEventListener('popstate', () => {
  const hash = location.hash.replace('#', '') || 'home';
  if (PAGES.includes(hash)) goToPage(hash);
});

// ========== LOADER ==========
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
  }
}

// ========== AUDIO PLAYER (FIXED) ==========
function initAudio() {
  const btn = document.getElementById('audioToggle');
  const audio = document.getElementById('bgAudio');
  
  if (!btn || !audio) return;

  // Button click handler
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleAudioToggle(audio, btn);
  });

  // Audio element event listeners - sync state with actual audio playback
  audio.addEventListener('play', () => {
    audioPlaying = true;
    btn.classList.add('active');
    localStorage.setItem('audioState', 'playing');
  });

  audio.addEventListener('pause', () => {
    audioPlaying = false;
    btn.classList.remove('active');
    localStorage.setItem('audioState', 'paused');
  });

  audio.addEventListener('error', (e) => {
    console.warn('Audio load error:', e.message || 'Audio file unavailable');
    audioPlaying = false;
    btn.classList.remove('active');
    localStorage.setItem('audioState', 'paused');
  });

  // Restore audio state from localStorage on page load
  const savedState = localStorage.getItem('audioState');
  if (savedState === 'playing') {
    audioPlaying = true;
    btn.classList.add('active');
    // Attempt autoplay - may be blocked by browser policy
    audio.play().catch(err => {
      console.warn('Autoplay blocked by browser:', err?.message || 'Browser policy');
      audioPlaying = false;
      btn.classList.remove('active');
      localStorage.setItem('audioState', 'paused');
    });
  }
}

// Global audio toggle function - can be called from anywhere
function handleAudioToggle(audio, btn) {
  if (!audio || !btn) {
    console.warn('Audio or button element not found');
    return;
  }

  if (audioPlaying) {
    // Pause the audio
    audio.pause();
  } else {
    // Play the audio
    const playPromise = audio.play();
    
    // Handle Promise returned by play() method
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay succeeded
          audioPlaying = true;
          btn.classList.add('active');
        })
        .catch(err => {
          // Autoplay failed
          console.warn('Audio play failed:', err?.message || 'Unknown error');
          audioPlaying = false;
          btn.classList.remove('active');
        });
    }
  }
}

// ========== TIME DISPLAY ==========
function initTime() {
  const timeEl = document.getElementById('footerTime');
  if (!timeEl) return;

  function updateTime() {
    try {
      const now = new Date();
      const time = now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      timeEl.textContent = 'WIB ' + time;
    } catch (e) {
      console.warn('Time update error:', e.message);
    }
  }

  updateTime();
  setInterval(updateTime, 1000);
}

// ========== NAVBAR SCROLL EFFECT ==========
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ========== MOBILE MENU ==========
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  const burger = document.getElementById('burger');
  
  if (!menu || !burger) return;

  const isOpen = menu.classList.contains('open');
  if (isOpen) {
    menu.classList.remove('open');
    burger.classList.remove('open');
  } else {
    menu.classList.add('open');
    burger.classList.add('open');
  }
}

// Close menu when clicking nav item
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('mob-nav-item')) {
    const menu = document.getElementById('mobile-menu');
    const burger = document.getElementById('burger');
    if (menu && burger) {
      menu.classList.remove('open');
      burger.classList.remove('open');
    }
  }
});

// ========== PAGE ROUTING ==========
function goToPage(page) {
  if (isAnimating || !PAGES.includes(page)) return;
  if (page === currentPage) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  isAnimating = true;

  // Kill all triggers
  scrollTriggers.forEach(st => {
    if (st && typeof st.kill === 'function') {
      st.kill();
    }
  });
  scrollTriggers = [];
  ScrollTrigger.getAll().forEach(st => st.kill());

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });

  // Show new page
  const newPage = document.getElementById('page-' + page);
  if (newPage) {
    newPage.classList.add('active');
  }

  // Update nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.getElementById('nav-' + page);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  currentPage = page;
  window.scrollTo(0, 0);

  setTimeout(() => {
    initFadeUpElements();
    initCountUpNumbers();
    
    switch(page) {
      case 'home':
        initHomeAnimations();
        break;
      case 'about':
        initAboutAnimations();
        break;
      case 'works':
        initWorksAnimations();
        break;
      case 'contact':
        initContactAnimations();
        break;
    }

    ScrollTrigger.refresh();
    isAnimating = false;
  }, 100);

  history.pushState(null, null, '#' + page);
}

// Make it globally available
window.goTo = goToPage;

// ========== BUILD REVEAL TEXT ==========
function buildRevealText() {
  const heading = document.getElementById('revealHead');
  if (!heading) return;

  const text = "I'm Khadiq — a student developer crafting clean code and beautiful interfaces that bring ideas to life.";
  const words = text.split(' ');
  heading.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
}

// ========== FADE UP ANIMATION ==========
function initFadeUpElements() {
  const elements = document.querySelectorAll('.page.active .fu');
  
  elements.forEach((el, i) => {
    el.classList.remove('v');

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          delay: (i % 5) * 0.08
        });
        el.classList.add('v');
      }
    });

    scrollTriggers.push(trigger);
  });
}

// ========== COUNT UP NUMBERS ==========
function initCountUpNumbers() {
  const elements = document.querySelectorAll('.page.active [data-target]');
  
  elements.forEach(el => {
    const target = parseInt(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    
    el.textContent = '0' + suffix;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        let current = 0;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          current = Math.floor(target * progress);
          el.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target + suffix;
          }
        };

        animate();
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    observer.observe(el);
  });
}

// ========== HOME PAGE ANIMATIONS ==========
function initHomeAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  const eyebrow = document.getElementById('hEye');
  const line1 = document.getElementById('hL1');
  const line2 = document.getElementById('hL2');
  const line3 = document.getElementById('hL3');
  const scroll = document.getElementById('hScroll');

  if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6 }, 0);
  if (line1) tl.fromTo(line1, { opacity: 0, y: 60, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: 0.8 }, 0.1);
  if (line2) tl.fromTo(line2, { opacity: 0, y: 60, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: 0.8 }, 0.2);
  if (line3) tl.fromTo(line3, { opacity: 0, y: 60, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: 0.8 }, 0.3);
  if (scroll) tl.fromTo(scroll, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.4);

  // Reveal heading word-by-word
  const heading = document.getElementById('revealHead');
  if (heading) {
    const trigger = ScrollTrigger.create({
      trigger: heading,
      start: 'top 80%',
      end: 'bottom 35%',
      scrub: 0.8,
      onUpdate: (self) => {
        const words = heading.querySelectorAll('.word');
        const activeCount = Math.floor(self.progress * words.length * 1.3);
        words.forEach((w, i) => {
          w.classList.toggle('lit', i < activeCount);
        });
      }
    });
    scrollTriggers.push(trigger);
  }

  // Footer signature
  const signature = document.getElementById('footerBig');
  if (signature) {
    const trigger = ScrollTrigger.create({
      trigger: signature,
      start: 'top 90%',
      onEnter: () => {
        gsap.fromTo(signature, 
          { opacity: 0, y: 40, scale: 0.95 }, 
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }
        );
      }
    });
    scrollTriggers.push(trigger);
  }
}

// ========== ABOUT PAGE ANIMATIONS ==========
function initAboutAnimations() {
  const title1 = document.getElementById('aphH1');
  const title2 = document.getElementById('aphH2');

  if (title1) {
    gsap.fromTo(title1, 
      { opacity: 0, y: 80 }, 
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
    );
  }

  if (title2) {
    gsap.fromTo(title2, 
      { opacity: 0, y: 80 }, 
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.3 }
    );
  }

  // Bio word-by-word
  const bioText = document.getElementById('bioWords');
  if (bioText && bioText.textContent) {
    const words = bioText.textContent.trim().split(/\s+/);
    bioText.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');

    const trigger = ScrollTrigger.create({
      trigger: bioText,
      start: 'top 75%',
      end: 'bottom 25%',
      scrub: 1,
      onUpdate: (self) => {
        const wordElements = bioText.querySelectorAll('.word');
        const activeCount = Math.floor(self.progress * wordElements.length * 1.25);
        wordElements.forEach((w, i) => {
          w.classList.toggle('lit', i < activeCount);
        });
      }
    });
    scrollTriggers.push(trigger);
  }

  // Footer
  const signature = document.getElementById('footerBig');
  if (signature) {
    const trigger = ScrollTrigger.create({
      trigger: signature,
      start: 'top 90%',
      onEnter: () => {
        gsap.fromTo(signature, 
          { opacity: 0, y: 40, scale: 0.95 }, 
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }
        );
      }
    });
    scrollTriggers.push(trigger);
  }
}

// ========== WORKS PAGE ANIMATIONS ==========
function initWorksAnimations() {
  const title1 = document.getElementById('wphH1');
  const title2 = document.getElementById('wphH2');

  if (title1) {
    gsap.fromTo(title1, 
      { opacity: 0, y: 80 }, 
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
    );
  }

  if (title2) {
    gsap.fromTo(title2, 
      { opacity: 0, y: 80 }, 
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.3 }
    );
  }

  // Footer
  const signature = document.getElementById('footerBig');
  if (signature) {
    const trigger = ScrollTrigger.create({
      trigger: signature,
      start: 'top 90%',
      onEnter: () => {
        gsap.fromTo(signature, 
          { opacity: 0, y: 40, scale: 0.95 }, 
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }
        );
      }
    });
    scrollTriggers.push(trigger);
  }
}

// ========== CONTACT PAGE ANIMATIONS ==========
function initContactAnimations() {
  const title = document.getElementById('contactH');

  if (title) {
    gsap.fromTo(title, 
      { opacity: 0, y: 80 }, 
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 }
    );
  }

  // Footer
  const signature = document.getElementById('footerBig');
  if (signature) {
    const trigger = ScrollTrigger.create({
      trigger: signature,
      start: 'top 90%',
      onEnter: () => {
        gsap.fromTo(signature, 
          { opacity: 0, y: 40, scale: 0.95 }, 
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }
        );
      }
    });
    scrollTriggers.push(trigger);
  }
}

// ========== INIT PAGE ==========
function initPage(page) {
  if (!PAGES.includes(page)) page = 'home';
  
  currentPage = page;

  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });

  const activePage = document.getElementById('page-' + page);
  if (activePage) {
    activePage.classList.add('active');
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.getElementById('nav-' + page);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  setTimeout(() => {
    initFadeUpElements();
    initCountUpNumbers();

    switch(page) {
      case 'home':
        initHomeAnimations();
        break;
      case 'about':
        initAboutAnimations();
        break;
      case 'works':
        initWorksAnimations();
        break;
      case 'contact':
        initContactAnimations();
        break;
    }

    ScrollTrigger.refresh();
  }, 100);
}

// ========== ERROR HANDLING ==========
window.addEventListener('error', (e) => {
  console.error('Global error:', e.message);
});

// ========== PREVENT MULTIPLE RAPID NAVIGATIONS ==========
let navigationTimeout = null;
const originalGoTo = window.goTo;
window.goTo = (page) => {
  if (navigationTimeout) return;
  
  navigationTimeout = setTimeout(() => {
    navigationTimeout = null;
  }, 500);

  originalGoTo(page);
};
