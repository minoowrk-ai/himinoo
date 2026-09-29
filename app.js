const pager = document.getElementById('pager');
const nav = document.getElementById('nav');
const sections = Array.from(pager.querySelectorAll('.section'));
const dotsContainer = document.getElementById('dots');

function goTo(index, smooth = true) {
  pager.scrollTo({ left: pager.clientWidth * index, behavior: smooth ? 'smooth' : 'auto' });
}

function currentIndex() {
  return Math.round(pager.scrollLeft / pager.clientWidth);
}

const home = document.createElement('button');
home.className = 'nav-home';
home.textContent = '작품 이름';
home.addEventListener('click', () => goTo(0));
nav.appendChild(home);

const navList = document.createElement('div');
navList.className = 'nav-list';
nav.appendChild(navList);

const navButtons = [];

sections.forEach((section, i) => {
  const label = document.createElement('div');
  label.className = 'index';
  label.textContent = `${String(i + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')} · ${section.dataset.label}`;
  section.querySelector('.content').prepend(label);

  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '') + (section.classList.contains('appendix') ? ' appendix' : '');
  dotsContainer.appendChild(dot);

  if (section.dataset.nav) {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.textContent = section.dataset.nav;
    btn.addEventListener('click', () => goTo(i));
    navList.appendChild(btn);
    navButtons[i] = btn;
  }
});
const dots = Array.from(dotsContainer.children);
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));

function setActive() {
  const index = currentIndex();
  prevBtn.classList.toggle('hidden', index === 0);
  nextBtn.classList.toggle('hidden', index === sections.length - 1);
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  navButtons.forEach((btn, i) => {
    if (!btn) return;
    const active = i === index;
    btn.classList.toggle('active', active);
    if (active) btn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  });
}

let scrollTimeout;
pager.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(setActive, 50);
});

let resizeIndex = 0;
window.addEventListener('resize', () => {
  resizeIndex = resizeIndex || currentIndex();
  clearTimeout(window.__resizeTimer);
  window.__resizeTimer = setTimeout(() => {
    goTo(resizeIndex, false);
    resizeIndex = 0;
    setActive();
  }, 100);
});

document.addEventListener('keydown', (e) => {
  const current = currentIndex();
  if (e.key === 'ArrowRight' && current < sections.length - 1) goTo(current + 1);
  else if (e.key === 'ArrowLeft' && current > 0) goTo(current - 1);
});

setActive();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
