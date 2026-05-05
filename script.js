// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== Mobile Nav Toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ===== Smooth Scroll & Active Nav =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

const observerOptions = {
  threshold: 0.3,
  rootMargin: '-80px 0px 0px 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));

// Add active style via JS
const activeStyle = document.createElement('style');
activeStyle.textContent = `.nav-links a.active { color: var(--primary) !important; background: rgba(108,99,255,0.1) !important; }`;
document.head.appendChild(activeStyle);

// ===== Scroll Animation (Fade In) =====
const fadeElements = document.querySelectorAll(
  '.timeline-card, .edu-card, .skill-card, .hobby-card, .photo-item, .contact-card'
);

fadeElements.forEach(el => el.classList.add('fade-in'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 80);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeElements.forEach(el => fadeObserver.observe(el));

// ===== Staggered animation for grids =====
const staggerGroups = [
  '.skills-grid .skill-card',
  '.hobbies-grid .hobby-card',
  '.edu-cards .edu-card',
  '.photos-grid .photo-item',
  '.contact-cards .contact-card',
];

staggerGroups.forEach(selector => {
  const items = document.querySelectorAll(selector);
  items.forEach((item, i) => {
    const origObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 100);
          origObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    origObserver.observe(item);
  });
});

// ===== Profile Photo Error Handling =====
const profilePhoto = document.getElementById('profilePhoto');
const photoPlaceholder = document.getElementById('photoPlaceholder');
if (profilePhoto) {
  profilePhoto.addEventListener('error', () => {
    profilePhoto.style.display = 'none';
    if (photoPlaceholder) {
      photoPlaceholder.style.display = 'flex';
    }
  });
  // Check if already loaded and errored
  if (profilePhoto.complete && profilePhoto.naturalWidth === 0) {
    profilePhoto.style.display = 'none';
    if (photoPlaceholder) photoPlaceholder.style.display = 'flex';
  }
}

// ===== Particle effect in hero =====
(function createParticles() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  const style = document.createElement('style');
  style.textContent = `
    .particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      animation: particleFloat linear infinite;
    }
    @keyframes particleFloat {
      0% { transform: translateY(100vh) scale(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 0.5; }
      100% { transform: translateY(-100px) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      background: rgba(${Math.random() > 0.5 ? '108,99,255' : '255,101,132'}, ${Math.random() * 0.4 + 0.1});
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * -15}s;
    `;
    heroBg.appendChild(p);
  }
})();

console.log('👋 赵龙杰的个人网站已加载完成！');
