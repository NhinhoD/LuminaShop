document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  document.addEventListener('mousemove', (e) => {
    if (cursor) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }
  });

  const hoverables = document.querySelectorAll('a, .product-card, .btn-explore');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (cursor) {
        cursor.style.width = '48px';
        cursor.style.height = '48px';
        cursor.style.backgroundColor = 'rgba(140, 122, 107, 0.15)';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (cursor) {
        cursor.style.width = '24px';
        cursor.style.height = '24px';
        cursor.style.backgroundColor = 'rgba(140, 122, 107, 0.05)';
      }
    });
  });

  const titles = document.querySelectorAll('.title-fade');
  let currentTitleIndex = 0;
  setInterval(() => {
    titles[currentTitleIndex].classList.remove('active');
    currentTitleIndex = (currentTitleIndex + 1) % titles.length;
    titles[currentTitleIndex].classList.add('active');
  }, 3000);

  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.header', {
      y: -30,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out',
      delay: 0.2
    });

    gsap.from('.hero-title-wrapper', {
      y: 40,
      opacity: 0,
      duration: 1.5,
      ease: 'power3.out'
    });

    gsap.from('.hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 1.5,
      ease: 'power3.out',
      delay: 0.3
    });

    gsap.from('.cta-wrapper', {
      scale: 0.95,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.5
    });

    gsap.from('.product-card', {
      scrollTrigger: {
        trigger: '.collection-section',
        start: 'top 75%',
      },
      y: 80,
      opacity: 0,
      stagger: 0.2,
      duration: 1.2,
      ease: 'power3.out'
    });

    gsap.from('.editorial-content', {
      scrollTrigger: {
        trigger: '.editorial-section',
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 1.5,
      ease: 'power3.out'
    });
  }
});