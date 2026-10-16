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
const logo = document.createElement('img');
logo.src = 'images/logo-full.svg';
logo.alt = 'GRADIA';
home.setAttribute('aria-label', 'GRADIA, 처음으로');
home.appendChild(logo);
home.addEventListener('click', () => goTo(0));
nav.appendChild(home);

const navList = document.createElement('div');
navList.className = 'nav-list';
nav.appendChild(navList);

const navByLabel = new Map();

sections.forEach((section, i) => {
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '') + (section.classList.contains('appendix') ? ' appendix' : '');
  dotsContainer.appendChild(dot);

  const label = section.dataset.nav;
  if (label && !navByLabel.has(label)) {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.textContent = label;
    btn.addEventListener('click', () => goTo(i));
    navList.appendChild(btn);
    navByLabel.set(label, btn);
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
  const activeLabel = sections[index].dataset.nav;
  navByLabel.forEach((btn, label) => {
    const active = label === activeLabel;
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

const features = Array.from(document.querySelectorAll('.feature'));

function activateFeature(target) {
  features.forEach((feature) => {
    const on = feature === target;
    feature.classList.toggle('active', on);
    feature.setAttribute('aria-pressed', String(on));
  });
}

features.forEach((feature) => {
  feature.addEventListener('click', () => activateFeature(feature));
  feature.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateFeature(feature);
    }
  });
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
