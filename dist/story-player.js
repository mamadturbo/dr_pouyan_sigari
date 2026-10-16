(() => {
'use strict';

// One gesture starts one complete, native video playback. Scroll never seeks it.
window.SigariStoryPlayback = (video, hooks, timers = window) => {
  let phase = 'idle';
  let watchdog;
  let destroyed = false;
  const locked = () => phase === 'armed' || phase === 'playing';
  const change = value => { phase = value; hooks.state(value); };
  const clearWatchdog = () => { timers.clearTimeout(watchdog); watchdog = undefined; };

  function progress() {
    const value = video.duration > 0 ? Math.min(1, video.currentTime / video.duration) : 0;
    hooks.progress(value);
  }

  function finish(reason) {
    if (!locked()) return;
    clearWatchdog();
    video.pause();
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
    hooks.lock();
    change('armed');
    return true;
  }

  function start() {
    if (phase === 'idle') arm();
    if (destroyed || phase !== 'armed') return false;
    change('playing');
    video.muted = true;
    try { video.currentTime = 0; } catch { /* Metadata may still be loading. */ }
    watchdog = timers.setTimeout(() => finish('timeout'), 8000);
    try {
      const result = video.play();
      result?.catch(() => { if (phase === 'playing') finish('error'); });
    } catch { finish('error'); }
    return true;
  }

  function reset() {
    if (locked()) finish('cancelled');
    clearWatchdog();
    video.pause();
    try { video.currentTime = 0; } catch { /* Metadata may still be loading. */ }
    change('idle');
    hooks.progress(0);
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
