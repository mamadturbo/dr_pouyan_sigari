(() => {
'use strict';

// One gesture starts one complete, native video playback. Scroll never seeks it.
window.SigariStoryPlayback = (video, hooks, timers = window) => {
  let phase = 'idle';
  let watchdog;
  let destroyed = false;
  let rangeStart = 0;
  let rangeEnd = Infinity;
  let progressFrame;
  let run = 0;
  const locked = () => phase === 'armed' || phase === 'playing';
  const change = value => { phase = value; hooks.state(value); };
  const clearWatchdog = () => { timers.clearTimeout(watchdog); watchdog = undefined; };

  function progress() {
    if (phase !== 'playing') return;
    const end = Math.min(rangeEnd, video.duration || rangeEnd);
    const value = end > rangeStart ? Math.max(0, Math.min(1, (video.currentTime - rangeStart) / (end - rangeStart))) : 0;
    hooks.progress(value);
  }

  function tick() {
    if (phase !== 'playing') return;
    progress();
    if (video.currentTime >= rangeEnd - .005) { finish('ended'); return; }
    progressFrame = timers.requestAnimationFrame?.(tick);
  }

  function finish(reason) {
    if (!locked()) return;
    clearWatchdog();
    timers.cancelAnimationFrame?.(progressFrame);
    video.pause();
    // A background tab may throttle animation callbacks; keep the correct outfit.
    if (reason === 'ended' && Number.isFinite(rangeEnd) && video.currentTime > rangeEnd + .025) {
      try { video.currentTime = rangeEnd - .008; } catch { /* Keep the last decoded frame. */ }
    }
    change('complete');
    try {
      if (reason === 'ended') hooks.progress(1);
      hooks.finish(reason);
    } finally { hooks.unlock(); }
  }

  function fail() {
    if (locked()) finish('error');
    else if (phase === 'idle') { change('failed'); hooks.finish('error'); }
  }

  function arm() {
    if (destroyed || phase !== 'idle') return false;
    change('armed');
    hooks.lock();
    return true;
  }

  function start(options = {}) {
    if (phase === 'idle') arm();
    if (destroyed || phase !== 'armed') return false;
    change('playing');
    const thisRun = ++run;
    rangeStart = options.from ?? 0;
    rangeEnd = options.to ?? Infinity;
    video.muted = true;
    try { if (Math.abs(video.currentTime - rangeStart) > .025) video.currentTime = rangeStart; } catch { /* Metadata may still be loading. */ }
    watchdog = timers.setTimeout(() => finish('timeout'), 8000);
    try {
      const result = video.play();
      result?.catch(() => { if (phase === 'playing' && run === thisRun) finish('error'); });
    } catch { finish('error'); }
    progressFrame = timers.requestAnimationFrame?.(tick);
    return true;
  }

  function reset(options = {}) {
    if (locked()) finish('cancelled');
    clearWatchdog();
    video.pause();
    if (!options.preserveFrame) try { video.currentTime = 0; } catch { /* Metadata may still be loading. */ }
    change('idle');
    if (!options.preserveFrame) hooks.progress(0);
    hooks.reset();
  }

  function cancel(reason = 'cancelled') {
    if (locked()) finish(reason);
    else if (phase === 'idle') change('complete');
  }

  const onPlaying = () => { if (phase === 'playing') hooks.ready(); };
  const onEnded = () => { if (phase === 'playing') finish('ended'); };
  video.addEventListener('playing', onPlaying);
  video.addEventListener('timeupdate', progress);
  video.addEventListener('ended', onEnded);
  video.addEventListener('error', fail);

  return {
    get phase() { return phase; },
    get locked() { return locked(); },
    arm, start, reset, cancel,
    destroy() {
      cancel('destroyed');
      clearWatchdog();
      destroyed = true;
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', progress);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', fail);
    },
  };
};
})();
