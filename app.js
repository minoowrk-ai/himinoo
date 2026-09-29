const pager = document.getElementById('pager');
const sections = Array.from(pager.querySelectorAll('.section'));
const dotsContainer = document.getElementById('dots');

sections.forEach((section, i) => {
  const label = document.createElement('div');
  label.className = 'index';
  label.textContent = `${String(i + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')} · ${section.dataset.label}`;
  section.prepend(label);

  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '') + (section.classList.contains('appendix') ? ' appendix' : '');
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
