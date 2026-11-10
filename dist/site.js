(() => {
'use strict';
// Classic deferred scripts also run when index.html is opened directly from disk.
const { doctor, timeline, services, papers, faqs } = window.SigariContent;
const assetSource = path => window.SigariAssets?.[path] ?? path;

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
let storyController;
function setMenu(open, returnFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
  mobileNav.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  if (open) storyController?.navigate();
  if (open) lenis?.stop();
  else if (!storyController?.locked) lenis?.start();
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
  lenis = new window.Lenis({ lerp: 0.065, wheelMultiplier: .85, smoothWheel: true, syncTouch: false });
  const tick = time => lenis?.raf(time * 1000);
  lenis.on('scroll', () => window.ScrollTrigger?.update());
  window.gsap.ticker.add(tick);
  stopSmoothScroll = () => { window.gsap.ticker.remove(tick); lenis?.destroy(); lenis = undefined; };
  if (storyController?.locked) lenis.stop();
}

// Offset anchors for the fixed header, and preserve keyboard focus on arrival.
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  event.preventDefault();
  storyController?.navigate();
  setMenu(false);
  const moveFocus = () => {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    // File URLs have an opaque origin in some browsers; navigation must still work.
    if (location.protocol !== 'file:') history.replaceState(null, '', link.getAttribute('href'));
  };
  if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.1, onComplete: moveFocus });
  else {
    const top = Math.max(0, scrollY + target.getBoundingClientRect().top - 90);
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    moveFocus();
  }
}));

const video = document.querySelector('#doctor-sequence');
const poster = document.querySelector('.story-poster');
const storyScroll = document.querySelector('.story-scroll');
const staticStory = document.querySelector('.story-static');
let currentStage = '';
let storyTextAnimation;

function setStage(surgical) {
  const next = surgical ? 'surgical' : 'academic';
  if (currentStage === next) return;
  const initial = currentStage === '';
  currentStage = next;
  const academic = document.querySelector('.story-academic');
  const surgery = document.querySelector('.story-surgical');
  const outgoing = surgical ? academic : surgery;
  const incoming = surgical ? surgery : academic;
  outgoing.inert = true;
  outgoing.setAttribute('aria-hidden', 'true');
  incoming.inert = false;
  incoming.removeAttribute('aria-hidden');
  if (!initial && window.gsap && !reducedMotion.matches) {
    const direction = surgical ? -1 : 1;
    storyTextAnimation?.kill();
    const pieces = incoming.querySelectorAll(':scope > .eyebrow, :scope > h2, :scope > .section-description, .story-facts > p, :scope > .text-link');
    window.gsap.killTweensOf([academic, surgery, ...pieces]);
    storyTextAnimation = window.gsap.timeline();
    storyTextAnimation.to(outgoing, { autoAlpha: 0, x: direction * -14, duration: .12, ease: 'power2.in' }, 0);
    storyTextAnimation.fromTo(incoming, { autoAlpha: 0, x: 0, y: 0, scale: 1, filter: 'none' }, { autoAlpha: 1, duration: .14 }, .04);
    storyTextAnimation.fromTo(pieces, { y: 14, x: direction * 10, opacity: 0, clipPath: 'inset(0 0 90% 0)' }, { y: 0, x: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', stagger: .025, duration: .26, ease: 'power3.out', clearProps: 'transform,opacity,clipPath' }, .05);
  } else {
    outgoing.style.opacity = '0'; outgoing.style.visibility = 'hidden';
    incoming.style.opacity = '1'; incoming.style.visibility = 'visible';
  }
  document.querySelector('.visual-label-text').textContent = surgical ? 'فعالیت جراحی و مراقبت' : 'مسیر علمی و دانشگاهی';
  document.querySelector('.visual-label-index').textContent = surgical ? '02 / 02' : '01 / 02';
  poster.src = assetSource(surgical ? 'assets/story-end.webp' : 'assets/story-start.webp');
  poster.alt = surgical ? 'دکتر سیگاری با لباس جراحی' : 'دکتر سیگاری با لباس رسمی';
  video.setAttribute('aria-label', poster.alt);
}

let animationContext;
let resizeTimer;

function measureScene() {
  const scene = document.querySelector('.story-card');
  const content = document.querySelector('.story-content');
  const styles = getComputedStyle(content);
  const textHeight = Math.max(...[...content.querySelectorAll('.story-state')].map(state => state.offsetHeight));
  const contentHeight = textHeight + parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
  const mobile = matchMedia('(max-width: 768px)').matches;
  // Both text states take part in grid sizing, including the visually hidden one.
  // Never crop a paragraph to force the complete scene into a short viewport.
  const requiredHeight = mobile ? contentHeight + 300 : Math.max(480, contentHeight);
  scene.style.setProperty('--story-required-height', `${Math.ceil(requiredHeight + 2)}px`);
  return { scene, mobile };
}

function createStoryController() {
  const scene = document.querySelector('.story-card');
  const stage = document.querySelector('.frame-stage');
  const status = document.querySelector('#story-playback-status');
  const button = document.querySelector('.story-play');
  let trigger;
  let anchorY = 0;
  let lockedY = 0;
  let armedAt = 0;
  let lastWheelAt = 0;
  let navigationUntil = 0;
  let touchY = 0;
  let freshTouch = false;
  let reversePlayback = false;
  let settlingUntil = 0;
  const midpoint = () => Number.isFinite(video.duration) ? video.duration / 2 : 46 / 60;
  const startTurn = () => playback.start(reversePlayback ? { from: midpoint(), to: midpoint() * 2 } : { from: 0, to: midpoint() });
  const nearAnchor = distance => Math.abs(scrollY - anchorY) < 3 || (scrollY > anchorY && scrollY + distance <= anchorY);

  function playBackwards() {
    if (playback.phase !== 'complete' || currentStage !== 'surgical') return false;
    reversePlayback = true;
    playback.reset({ preserveFrame: true });
    playback.arm();
    return startTurn();
  }

  function positionAt(y) {
    lenis?.scrollTo(y, { immediate: true, force: true });
    window.scrollTo({ top: y, behavior: 'instant' });
  }

  function unlock() {
    document.documentElement.classList.remove('story-scroll-locked');
    // Discard momentum accumulated during playback before accepting a new gesture.
    settlingUntil = performance.now() + 140;
    if (mobileNav.hidden) lenis?.start();
  }

  const playback = window.SigariStoryPlayback(video, {
    lock() {
      lockedY = anchorY;
      lenis?.stop();
      document.documentElement.classList.add('story-scroll-locked');
      positionAt(lockedY);
      armedAt = performance.now();
      freshTouch = false;
    },
    unlock,
    state(phase) {
      scene.dataset.playback = phase;
      video.dataset.playback = phase;
      button.disabled = phase === 'playing';
      if (phase === 'armed') status.textContent = 'صفحه ثابت شد؛ با یک اسکرول دیگر، چرخش کامل اجرا می‌شود.';
      if (phase === 'playing') status.textContent = 'چرخش در حال اجراست؛ پس از پایان، اسکرول صفحه آزاد می‌شود.';
      if (phase === 'complete') {
        status.textContent = 'چرخش کامل شد؛ می‌توانید به ادامهٔ صفحه بروید.';
        button.firstChild.textContent = 'پخش دوبارهٔ چرخش ';
      }
    },
    progress(value) {
      const forwardProgress = reversePlayback ? 1 - value : value;
      setStage(forwardProgress >= .56);
      document.querySelector('.story-progress i').style.transform = `scaleX(${forwardProgress})`;
      video.dataset.progress = forwardProgress.toFixed(3);
    },
    ready() { stage.classList.add('sequence-ready'); },
    finish(reason) {
      scene.dataset.result = reason;
      if (reason === 'error' || reason === 'timeout') {
        stage.classList.remove('sequence-ready');
        status.textContent = 'ویدئو پخش نشد؛ تصویر ثابت نمایش داده می‌شود و اسکرول صفحه آزاد است.';
        button.firstChild.textContent = 'تلاش دوباره برای پخش ';
      } else if (reason !== 'ended') status.textContent = 'اسکرول صفحه آزاد است؛ برای اجرای چرخش می‌توانید دکمه را بزنید.';
    },
    reset() {
      delete scene.dataset.result;
      button.firstChild.textContent = 'اجرای چرخش پزشک ';
      status.textContent = 'وقتی به تصویر رسیدید، با یک اسکرول چرخش کامل آغاز می‌شود.';
    },
  });

  function canArm() {
    return playback.phase === 'idle' && performance.now() >= navigationUntil && mobileNav.hidden;
  }

  function onWheel(event) {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const now = performance.now();
    const gap = now - lastWheelAt;
    lastWheelAt = now;
    if (playback.phase === 'playing') { event.preventDefault(); return; }
    if (now < settlingUntil && gap < 120) { event.preventDefault(); return; }
    const distance = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (playback.phase === 'complete' && currentStage === 'surgical' && distance < 0 && nearAnchor(distance)) {
      event.preventDefault();
      playBackwards();
      return;
    }
    if (playback.phase === 'armed') {
      if (event.deltaY < 0) { playback.cancel('back'); return; }
      event.preventDefault();
      // Ignore the inertial tail of the gesture that brought the scene into view.
      if (event.deltaY > 0 && now - armedAt > 140 && gap > 120) startTurn();
      return;
    }
    if (playback.phase === 'complete' && reversePlayback && currentStage === 'academic' && distance > 0 && Math.abs(scrollY - anchorY) < 3) {
      event.preventDefault();
      reversePlayback = false;
      playback.reset({ preserveFrame: true });
      playback.arm(); startTurn(); return;
    }
    if (canArm() && distance > 0 && scrollY < anchorY && scrollY + distance >= anchorY) {
      event.preventDefault();
      playback.arm();
    }
  }

  function onKey(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const up = ['ArrowUp', 'PageUp', 'Home'].includes(event.key) || (event.key === ' ' && event.shiftKey);
    const down = ['ArrowDown', 'PageDown', 'End'].includes(event.key) || (event.key === ' ' && !event.shiftKey);
    if (!playback.locked && playback.phase === 'complete' && currentStage === 'surgical' && up && nearAnchor(-innerHeight * .8)) { event.preventDefault(); playBackwards(); return; }
    if (!playback.locked && playback.phase === 'complete' && reversePlayback && down && Math.abs(scrollY - anchorY) < 3) {
      event.preventDefault(); reversePlayback = false; playback.reset({ preserveFrame: true }); playback.arm(); startTurn(); return;
    }
    if (!playback.locked) return;
    if (event.key === 'Escape') { event.preventDefault(); playback.cancel(); return; }
    if (playback.phase === 'playing' && (down || up)) { event.preventDefault(); return; }
    if (playback.phase === 'armed' && down) { event.preventDefault(); startTurn(); }
    else if (playback.phase === 'armed' && up) playback.cancel('back');
  }

  function onTouchStart(event) {
    touchY = event.touches[0]?.clientY ?? 0;
    freshTouch = playback.phase === 'armed';
  }

  function onTouchMove(event) {
    if (event.touches.length !== 1) return;
    const distance = touchY - event.touches[0].clientY;
    if (playback.phase === 'playing') { event.preventDefault(); return; }
    if (performance.now() < settlingUntil) { event.preventDefault(); return; }
    if (playback.phase === 'complete' && reversePlayback && distance > 12 && Math.abs(scrollY - anchorY) < 3) {
      event.preventDefault(); reversePlayback = false; playback.reset({ preserveFrame: true }); playback.arm(); startTurn(); return;
    }
    if (playback.phase === 'complete' && currentStage === 'surgical' && distance < -12 && nearAnchor(distance)) {
      event.preventDefault();
      playBackwards();
      return;
    }
    if (playback.phase === 'armed') {
      if (distance < -12) { playback.cancel('back'); return; }
      event.preventDefault();
      if (distance > 12 && freshTouch) { freshTouch = false; startTurn(); }
    } else if (canArm() && distance > 12 && scrollY < anchorY && scrollY + distance >= anchorY) {
      event.preventDefault();
      playback.arm();
    }
  }

  function guardScroll() {
    if (playback.locked && Math.abs(scrollY - lockedY) > 1) positionAt(lockedY);
  }

  function refresh() {
    trigger?.kill();
    measureScene();
    const top = document.querySelector('.header-inner').offsetHeight + 12;
    const fits = scene.offsetHeight <= innerHeight - top - 12;
    const focus = fits ? scene : scene.querySelector('.story-visual');
    const focusTop = fits ? top : top + Math.max(0, (innerHeight - top - 12 - focus.offsetHeight) / 2);
    anchorY = Math.max(0, Math.ceil(scrollY + focus.getBoundingClientRect().top - focusTop));
    scene.dataset.layout = fits ? 'gesture-lock' : 'gesture-focus';
    if (playback.locked) { lockedY = anchorY; positionAt(lockedY); }
    trigger = window.ScrollTrigger.create({
      id: 'doctor-story', trigger: focus, start: `top ${focusTop}px`, end: 'bottom top',
      onEnter: () => { if (canArm()) playback.arm(); },
      onLeaveBack: () => {
        if (playback.phase === 'complete' && currentStage === 'surgical' && performance.now() >= navigationUntil) { playBackwards(); return; }
        if (!playback.locked && playback.phase !== 'failed') {
          playback.reset({ preserveFrame: true });
          reversePlayback = false;
          setStage(false);
        }
      },
    });
  }

  function onButton() {
    if (playback.phase === 'playing') return;
    if (video.error) video.load();
    if (playback.phase === 'complete' || playback.phase === 'failed') {
      if (currentStage === 'surgical') { playBackwards(); return; }
      reversePlayback = false;
      playback.reset({ preserveFrame: true });
    }
    playback.arm();
    startTurn();
  }

  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
  window.addEventListener('keydown', onKey, { capture: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
  window.addEventListener('scroll', guardScroll, { passive: true });
  button.addEventListener('click', onButton);
  const showDecodedFrame = () => { if (!video.error) stage.classList.add('sequence-ready'); };
  video.addEventListener('loadeddata', showDecodedFrame);
  video.src = assetSource('assets/doctor-turn-flow.mp4');
  video.muted = true;
  setStage(false);
  scene.dataset.playback = 'idle';
  refresh();

  return {
    get locked() { return playback.locked; },
    refresh,
    navigate() { navigationUntil = performance.now() + 1800; playback.cancel('navigation'); },
    destroy() {
      trigger?.kill();
      playback.destroy();
      unlock();
      window.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchmove', onTouchMove, true);
      window.removeEventListener('scroll', guardScroll);
      button.removeEventListener('click', onButton);
      video.removeEventListener('loadeddata', showDecodedFrame);
    },
  };
}

function setupAnimations() {
  storyController?.destroy();
  storyController = undefined;
  animationContext?.revert();
  currentStage = '';
  setupSmoothScroll();
  const canAnimate = !reducedMotion.matches && window.gsap && window.ScrollTrigger && window.SigariStoryPlayback;
  storyScroll.hidden = !canAnimate;
  staticStory.hidden = !!canAnimate;
  if (!canAnimate) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  storyController = createStoryController();
  animationContext = gsap.context(() => {
    gsap.to('.orbit-one', { y: -25, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.story-scroll', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.to('.orbit-two', { y: 20, x: -12, ease: 'none', scrollTrigger: { trigger: '.story-scroll', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    // Content stays readable even when a background tab throttles animation frames.
    gsap.from('.hero-copy > *', { y: 24, opacity: .5, duration: .85, stagger: .09, ease: 'power2.out', clearProps: 'transform,opacity' });
    gsap.from('.hero-photo', { opacity: .5, scale: 1.025, duration: 1.2, ease: 'power2.out', clearProps: 'transform,opacity' });
    gsap.utils.toArray('.reveal').forEach(title => {
      gsap.from(title, { y: 24, opacity: .45, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: title, start: 'top 94%', once: true }, clearProps: 'opacity,transform' });
    });
    ['.service-card', '.research-card', '.timeline li', '.journey-steps li'].forEach(selector => {
      ScrollTrigger.batch(selector, { start: 'top 96%', once: true, onEnter: batch => gsap.fromTo(batch, { y: 22, opacity: .5 }, { y: 0, opacity: 1, duration: .7, stagger: .1, ease: 'power2.out', clearProps: 'opacity,transform' }) });
    });
  });
  document.fonts.ready.then(() => { storyController?.refresh(); ScrollTrigger.refresh(); });
}

setupAnimations();
reducedMotion.addEventListener('change', setupAnimations);
matchMedia('(min-width: 769px) and (pointer: fine)').addEventListener('change', setupSmoothScroll);
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { storyController?.refresh(); window.ScrollTrigger?.refresh(); }, 180);
});
window.addEventListener('pageshow', event => { if (event.persisted) { storyController?.refresh(); window.ScrollTrigger?.refresh(); } });

// A direct section URL should settle after fonts and pin spacing have been measured.
if (location.hash) {
  let destination;
  try { destination = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { /* Ignore malformed URL fragments. */ }
  if (destination) document.fonts.ready.then(() => requestAnimationFrame(() => {
    window.ScrollTrigger?.refresh();
    window.scrollTo({ top: Math.max(0, scrollY + destination.getBoundingClientRect().top - 90), behavior: 'instant' });
  }));
}
})();
