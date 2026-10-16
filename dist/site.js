import { doctor, timeline, services, papers, faqs } from './content.js';

const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const external = 'target="_blank" rel="noopener noreferrer"';
const persianNumber = (value) => String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[digit]);

document.querySelector('#timeline-list').innerHTML = timeline.map(item => `<li><span class="timeline-year">${item.year}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p><div class="timeline-sources"><a href="${item.url}" ${external} aria-label="مشاهدهٔ منبع ${escapeHTML(item.title)} در پنجرهٔ جدید">گزارش و منبع ${icon('external')}</a>${item.extraUrl ? `<a href="${item.extraUrl}" ${external}>منبع تکمیلی ${icon('external')}</a>` : ''}</div></li>`).join('');
document.querySelector('#service-list').innerHTML = services.map((item, index) => `<article class="service-card"><div class="service-card-top">${icon(item.icon)}<span class="service-number">${persianNumber(String(index + 1).padStart(2, '0'))}</span></div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p><a class="text-link" href="tel:${doctor.telephone}" aria-label="تماس برای مشاوره دربارهٔ ${escapeHTML(item.title)}">هماهنگی مشاوره ${icon('arrow')}</a></article>`).join('');
document.querySelector('#paper-list').innerHTML = papers.map(item => `<article class="research-card"><div class="paper-art" aria-hidden="true"><span class="art-year">${item.year}</span>${icon(item.icon)}<span class="art-caption" lang="en" dir="ltr">RESEARCH / P. SIGARI</span></div><div class="research-card-body"><span class="paper-tag">${item.tag} / ${item.year}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p><span class="paper-english" lang="en">${escapeHTML(item.english)}</span><a class="text-link" href="${item.url}" ${external} aria-label="مشاهدهٔ مقالهٔ ${escapeHTML(item.title)} در پنجرهٔ جدید">مشاهدهٔ مقاله ${icon('external')}</a></div></article>`).join('');
document.querySelector('#faq-list').innerHTML = faqs.map(item => `<details class="faq-item"><summary>${escapeHTML(item.question)}${icon('plus')}</summary><div class="faq-answer">${escapeHTML(item.answer)}</div></details>`).join('');
document.querySelectorAll('[data-doctor]').forEach(element => { element.textContent = doctor[element.dataset.doctor]; });
document.querySelectorAll('[data-link]').forEach(element => { element.href = doctor[element.dataset.link]; });
document.querySelectorAll('a[href^="tel:"]').forEach(element => { element.href = `tel:${doctor.telephone}`; });
document.querySelector('.hero-name').textContent = doctor.name;
document.querySelector('.hero-specialty').textContent = doctor.specialty;
document.querySelector('.contact-phone strong').textContent = doctor.displayPhone;

// Keep one FAQ open without intercepting the native keyboard interaction.
const details = [...document.querySelectorAll('.faq-item')];
details.forEach(detail => detail.addEventListener('toggle', () => {
  if (detail.open) details.forEach(other => { if (other !== detail) other.open = false; });
}));

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function setMenu(open, returnFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
  mobileNav.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  if (open) header.classList.add('is-scrolled');
  else header.classList.toggle('is-scrolled', scrollY > 60);
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') setMenu(false, true);
  if (event.key === 'Tab') {
    const items = [menuButton, ...mobileNav.querySelectorAll('a')];
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.matchMedia('(min-width: 1001px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 60 || !mobileNav.hidden), { passive: true });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis;
let stopSmoothScroll;
function setupSmoothScroll() {
  stopSmoothScroll?.();
  lenis = undefined;
  if (reducedMotion.matches || !window.Lenis || !window.gsap || !matchMedia('(min-width: 769px) and (pointer: fine)').matches) return;
  lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: false });
  const tick = time => lenis?.raf(time * 1000);
  lenis.on('scroll', () => window.ScrollTrigger?.update());
  window.gsap.ticker.add(tick);
  stopSmoothScroll = () => { window.gsap.ticker.remove(tick); lenis?.destroy(); lenis = undefined; };
}

// Offset anchors for the fixed header, and preserve keyboard focus on arrival.
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  event.preventDefault();
  setMenu(false);
  const moveFocus = () => {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', link.getAttribute('href'));
  };
  if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.1, onComplete: moveFocus });
  else {
    const top = Math.max(0, scrollY + target.getBoundingClientRect().top - 90);
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    moveFocus();
  }
}));

const canvas = document.querySelector('#doctor-sequence');
const context = canvas.getContext('2d', { alpha: false });
const poster = document.querySelector('.story-poster');
const storyScroll = document.querySelector('.story-scroll');
const staticStory = document.querySelector('.story-static');
const frameCount = 57;
const frames = new Array(frameCount);
const failed = new Set();
let requestedFrame = 0;
let lastRenderedFrame = -1;
let sequenceStarted = false;
let currentStage = '';

function renderFrame(index) {
  requestedFrame = Math.min(frameCount - 1, Math.max(0, Math.round(index)));
  if (!context) return;
  // The poster remains visible until the desired frame is available; no blank flash.
  const available = frames[requestedFrame];
  if (!available) return;
  if (lastRenderedFrame === requestedFrame) return;
  context.drawImage(available, 0, 0, canvas.width, canvas.height);
  lastRenderedFrame = requestedFrame;
  canvas.dataset.frame = String(requestedFrame + 1);
  document.querySelector('.frame-stage').classList.add('sequence-ready');
}

async function loadSequence() {
  if (sequenceStarted || reducedMotion.matches) return;
  sequenceStarted = true;
  // Load endpoints, then spread anchor frames before filling the short sequence.
  const anchorFrames = [0, 56, 28, 14, 42, 7, 21, 35, 49];
  const queue = [...new Set([...anchorFrames, ...Array.from({ length: frameCount }, (_, index) => index)])];
  async function worker() {
    while (queue.length) {
      const index = queue.shift();
      try {
        const frame = new Image();
        frame.decoding = 'async';
        frame.src = `assets/frames/frame-${String(index + 1).padStart(3, '0')}.webp`;
        await frame.decode();
        frames[index] = frame;
        if (requestedFrame === index) renderFrame(index);
      } catch { failed.add(index); }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  canvas.dataset.loadedFrames = String(frames.filter(Boolean).length);
  canvas.dataset.failedFrames = String(failed.size);
  renderFrame(requestedFrame);
}

function setStage(surgical) {
  const next = surgical ? 'surgical' : 'academic';
  if (currentStage === next) return;
  currentStage = next;
  const academic = document.querySelector('.story-academic');
  const surgery = document.querySelector('.story-surgical');
  const outgoing = surgical ? academic : surgery;
  const incoming = surgical ? surgery : academic;
  outgoing.inert = true;
  outgoing.setAttribute('aria-hidden', 'true');
  incoming.inert = false;
  incoming.removeAttribute('aria-hidden');
  if (window.gsap && !reducedMotion.matches) {
    window.gsap.to(outgoing, { autoAlpha: 0, y: surgical ? -12 : 12, duration: .22, overwrite: true });
    window.gsap.fromTo(incoming, { autoAlpha: 0, y: surgical ? 14 : -14 }, { autoAlpha: 1, y: 0, duration: .38, delay: .12, overwrite: true });
  } else {
    outgoing.style.opacity = '0'; outgoing.style.visibility = 'hidden';
    incoming.style.opacity = '1'; incoming.style.visibility = 'visible';
  }
  document.querySelector('.visual-label-text').textContent = surgical ? 'فعالیت جراحی و مراقبت' : 'مسیر علمی و دانشگاهی';
  document.querySelector('.visual-label-index').textContent = surgical ? '02 / 02' : '01 / 02';
  poster.src = surgical ? 'assets/story-end.webp' : 'assets/story-start.webp';
  poster.alt = surgical ? 'دکتر سیگاری با لباس جراحی' : 'دکتر سیگاری با لباس رسمی';
  canvas.setAttribute('aria-label', poster.alt);
}

function updateSequence(progress) {
  // Hold the first and last poses briefly so the story has a clear beginning/end.
  const normalized = Math.max(0, Math.min(1, (progress - .08) / .84));
  const index = Math.round(normalized * (frameCount - 1));
  setStage(normalized >= .56);
  if (!frames[index]) {
    // Missing or slow frames fall back to a pose rather than a frozen wrong outfit.
    document.querySelector('.frame-stage').classList.remove('sequence-ready');
    lastRenderedFrame = -1;
  }
  renderFrame(index);
  document.querySelector('.story-progress i').style.transform = `scaleX(${progress})`;
  canvas.dataset.progress = progress.toFixed(3);
}

let animationContext;
function setupAnimations() {
  animationContext?.revert();
  currentStage = '';
  setupSmoothScroll();
  const canAnimate = !reducedMotion.matches && window.gsap && window.ScrollTrigger && context;
  storyScroll.hidden = !canAnimate;
  staticStory.hidden = !!canAnimate;
  if (!canAnimate) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  let sceneTrigger;
  animationContext = gsap.context(() => {
    const media = gsap.matchMedia();
    media.add({ desktop: '(min-width: 769px)', mobile: '(max-width: 768px)' }, scope => {
      const mobile = scope.conditions.mobile;
      const scene = document.querySelector('.story-card');
      sceneTrigger = ScrollTrigger.create({
        trigger: scene,
        start: mobile ? 'top 84px' : 'top 104px',
        end: () => `+=${Math.round(innerHeight * (mobile ? 1.15 : 2))}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => updateSequence(self.progress),
        onRefresh: self => updateSequence(self.progress),
      });
      gsap.to('.orbit-one', { y: mobile ? -20 : -45, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.story-scroll', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('.orbit-two', { y: mobile ? 15 : 45, x: -12, ease: 'none', scrollTrigger: { trigger: '.story-scroll', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
    gsap.from('.hero-copy > *', { y: 24, opacity: 0, duration: .85, stagger: .09, ease: 'power2.out', clearProps: 'transform,opacity' });
    gsap.from('.hero-photo', { opacity: 0, scale: 1.025, duration: 1.2, ease: 'power2.out', clearProps: 'transform,opacity' });
    gsap.utils.toArray('.reveal').forEach(title => {
      gsap.from(title, { y: 24, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: title, start: 'top 94%', once: true }, clearProps: 'opacity,transform' });
    });
    ['.service-card', '.research-card', '.timeline li', '.journey-steps li'].forEach(selector => {
      ScrollTrigger.batch(selector, { start: 'top 96%', once: true, onEnter: batch => gsap.fromTo(batch, { y: 22, opacity: .2 }, { y: 0, opacity: 1, duration: .7, stagger: .1, ease: 'power2.out', clearProps: 'opacity,transform' }) });
    });
    return () => media.revert();
  });
  updateSequence(sceneTrigger?.progress ?? 0);
  const loader = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { loadSequence(); loader.disconnect(); }
  }, { rootMargin: '900px' });
  loader.observe(storyScroll);
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

setupAnimations();
reducedMotion.addEventListener('change', setupAnimations);
matchMedia('(min-width: 769px) and (pointer: fine)').addEventListener('change', setupSmoothScroll);
window.addEventListener('pageshow', event => { if (event.persisted) window.ScrollTrigger?.refresh(); });

// A direct section URL should settle after fonts and pin spacing have been measured.
if (location.hash) {
  const destination = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (destination) document.fonts.ready.then(() => requestAnimationFrame(() => {
    window.ScrollTrigger?.refresh();
    window.scrollTo({ top: Math.max(0, scrollY + destination.getBoundingClientRect().top - 90), behavior: 'instant' });
  }));
}
