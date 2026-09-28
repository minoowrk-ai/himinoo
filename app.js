const pager = document.getElementById('pager');
const sections = Array.from(pager.querySelectorAll('.section'));
const dotsContainer = document.getElementById('dots');

sections.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dotsContainer.appendChild(dot);
});
const dots = Array.from(dotsContainer.children);

function setActiveByScroll() {
  const index = Math.round(pager.scrollLeft / pager.clientWidth);
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}

let scrollTimeout;
pager.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(setActiveByScroll, 50);
});

document.addEventListener('keydown', (e) => {
  const current = Math.round(pager.scrollLeft / pager.clientWidth);
  if (e.key === 'ArrowRight' && current < sections.length - 1) {
    pager.scrollTo({ left: pager.clientWidth * (current + 1), behavior: 'smooth' });
  } else if (e.key === 'ArrowLeft' && current > 0) {
    pager.scrollTo({ left: pager.clientWidth * (current - 1), behavior: 'smooth' });
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
