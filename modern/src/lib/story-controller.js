import { createStoryPlayback } from './story-player.js';
// Preserved, scoped legacy animation controller; React owns its complete lifetime.
export function mountStory(root, gsap, ScrollTrigger, { managed = false } = {}) {
  gsap.registerPlugin(ScrollTrigger);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const assetSource = path => '/'+path;
  const lenis = undefined; // Native scroll owns navigation on all routes.
  const mobileNav = document.querySelector('#mobile-nav');
  const video = root.querySelector('#doctor-sequence');
  const poster = root.querySelector('.story-poster');
  // Playback feedback remains available to assistive technology without visible controls.
  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  root.append(status);
  let currentStage = '';
  let storyTextAnimation;
function setStage(surgical) {
  const next = surgical ? 'surgical' : 'academic';
  if (currentStage === next) return;
  const initial = currentStage === '';
  currentStage = next;
  const academic = root.querySelector('.story-academic');
  const surgery = root.querySelector('.story-surgical');
  const outgoing = surgical ? academic : surgery;
  const incoming = surgical ? surgery : academic;
  outgoing.inert = true;
  outgoing.setAttribute('aria-hidden', 'true');
  incoming.inert = false;
  incoming.removeAttribute('aria-hidden');
  if (!initial && gsap && !reducedMotion.matches) {
    const direction = surgical ? -1 : 1;
    storyTextAnimation?.kill();
    const pieces = incoming.querySelectorAll(':scope > .eyebrow, :scope > h2, :scope > .section-description, .story-facts > p, :scope > .text-link');
    gsap.killTweensOf([academic, surgery, ...pieces]);
    storyTextAnimation = gsap.timeline();
    storyTextAnimation.to(outgoing, { autoAlpha: 0, x: direction * -14, duration: .12, ease: 'power2.in' }, 0);
    storyTextAnimation.fromTo(incoming, { autoAlpha: 0, x: 0, y: 0, scale: 1, filter: 'none' }, { autoAlpha: 1, duration: .14 }, .04);
    storyTextAnimation.fromTo(pieces, { y: 14, x: direction * 10, opacity: 0, clipPath: 'inset(0 0 90% 0)' }, { y: 0, x: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', stagger: .025, duration: .26, ease: 'power3.out', clearProps: 'transform,opacity,clipPath' }, .05);
  } else {
    outgoing.style.opacity = '0'; outgoing.style.visibility = 'hidden';
    incoming.style.opacity = '1'; incoming.style.visibility = 'visible';
  }
  poster.src = assetSource(surgical ? 'assets/story-end.webp' : 'assets/story-start.webp');
  poster.alt = surgical ? 'دکتر سیگاری با لباس جراحی' : 'دکتر سیگاری با لباس رسمی';
  video.setAttribute('aria-label', poster.alt);
}

let animationContext;
let resizeTimer;

function measureScene() {
  const scene = root.querySelector('.story-card');
  const content = root.querySelector('.story-content');
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
  const scene = root.querySelector('.story-card');
  const stage = root.querySelector('.frame-stage');
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
    if (managed) { root.dispatchEvent(new Event('sigari:story-state', { bubbles: true })); return; }
    document.documentElement.classList.remove('story-scroll-locked');
    // Discard momentum accumulated during playback before accepting a new gesture.
    settlingUntil = performance.now() + 140;
    if (mobileNav.hidden) lenis?.start();
  }

  const playback = createStoryPlayback(video, {
    lock() {
      if (managed) return;
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
      if (managed) queueMicrotask(() => root.dispatchEvent(new Event('sigari:story-state', { bubbles: true })));
      if (phase === 'armed') status.textContent = 'صفحه ثابت شد؛ با یک اسکرول دیگر، چرخش کامل اجرا می‌شود.';
      if (phase === 'playing') status.textContent = 'چرخش در حال اجراست؛ پس از پایان، اسکرول صفحه آزاد می‌شود.';
      if (phase === 'complete') {
        status.textContent = 'چرخش کامل شد؛ می‌توانید به ادامهٔ صفحه بروید.';
      }
    },
    progress(value) {
      const forwardProgress = reversePlayback ? 1 - value : value;
      setStage(forwardProgress >= .56);
      video.dataset.progress = forwardProgress.toFixed(3);
    },
    ready() { stage.classList.add('sequence-ready'); },
    finish(reason) {
      scene.dataset.result = reason;
      if (reason === 'error' || reason === 'timeout') {
        stage.classList.remove('sequence-ready');
        status.textContent = 'ویدئو پخش نشد؛ تصویر ثابت نمایش داده می‌شود و اسکرول صفحه آزاد است.';
      } else if (reason !== 'ended') status.textContent = 'اسکرول صفحه آزاد است؛ با اسکرول می‌توانید ادامه دهید.';
    },
    reset() {
      delete scene.dataset.result;
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
    if (managed) { scene.dataset.layout = 'managed'; return; }
    const top = document.querySelector('.header-inner').offsetHeight + 12;
    const controlsHeight = 0;
    const fits = scene.offsetHeight + controlsHeight <= innerHeight - top - 12;
    const focus = fits ? scene : scene.querySelector('.frame-stage');
    const focusTop = fits ? top : top + Math.max(0, (innerHeight - top - controlsHeight - 24 - focus.offsetHeight) / 2);
    anchorY = Math.max(0, Math.ceil(scrollY + focus.getBoundingClientRect().top - focusTop));
    scene.dataset.layout = fits ? 'gesture-lock' : 'gesture-focus';
    scene.parentElement.dataset.layout = scene.dataset.layout;
    if (playback.locked) { lockedY = anchorY; positionAt(lockedY); }
    trigger = ScrollTrigger.create({
      id: 'doctor-story', trigger: focus, start: `top ${focusTop}px`, end: 'bottom top',
      // A trigger created while already below the scene must not pull readers back.
      onEnter: self => { if (canArm() && self.isActive) playback.arm(); },
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

  if (!managed) {
  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
  window.addEventListener('keydown', onKey, { capture: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
  window.addEventListener('scroll', guardScroll, { passive: true });
  }
  const showDecodedFrame = () => { if (!video.error) stage.classList.add('sequence-ready'); };
  video.addEventListener('loadeddata', showDecodedFrame);
  video.src = assetSource('assets/doctor-turn-flow.mp4');
  video.muted = true;
  setStage(false);
  scene.dataset.playback = 'idle';
  delete scene.dataset.result;
  status.textContent = managed ? 'با یک اسکرول بعدی، چرخش پزشک اجرا می‌شود.' : 'وقتی به تصویر رسیدید، با یک اسکرول چرخش کامل آغاز می‌شود.';
  refresh();

  return {
    get locked() { return playback.locked; },
    step(direction) {
      if (playback.locked) return true;
      if (video.error || scene.dataset.result === 'error' || scene.dataset.result === 'timeout') return false;
      if ((direction > 0 && currentStage === 'surgical') || (direction < 0 && currentStage === 'academic')) return false;
      reversePlayback = direction < 0;
      playback.reset({ preserveFrame: true });
      playback.arm();
      startTurn();
      return true;
    },
    cancel() { playback.cancel(); },
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
      video.removeEventListener('loadeddata', showDecodedFrame);
    },
  };
}


  let controller;
  const context = gsap.context(() => { controller = createStoryController(); }, root);
  let disposed = false;
  const resize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { controller.refresh(); ScrollTrigger.refresh(); }, 180); };
  const navigate = event => { if(event.target.closest('a, .menu-toggle')) controller.navigate(); };
  const onShow = () => { controller.refresh(); ScrollTrigger.refresh(); };
  window.addEventListener('resize', resize);
  window.addEventListener('pageshow', onShow);
  document.addEventListener('click', navigate, true);
  document.fonts.ready.then(() => { if(!disposed) onShow(); });
  return { step: direction => controller.step(direction), get locked() { return controller.locked; }, cancel: () => controller.cancel(), refresh: () => controller.refresh(), destroy() {
    disposed = true;
    clearTimeout(resizeTimer);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pageshow', onShow);
    document.removeEventListener('click', navigate, true);
    controller.destroy();
    storyTextAnimation?.revert();
    context.revert();
    root.querySelector('.frame-stage').classList.remove('sequence-ready');
    video.pause(); video.removeAttribute('src'); video.load();
    poster.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    status.remove();
  }};
}
