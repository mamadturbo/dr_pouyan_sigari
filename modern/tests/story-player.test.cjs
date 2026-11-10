const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(require('node:path').join(__dirname, '../src/lib/story-player.js'), 'utf8').replace('export const createStoryPlayback =', 'window.SigariStoryPlayback ='), sandbox);

function fixture() {
  class Video extends EventTarget {
    currentTime = 0;
    duration = 1.9;
    plays = 0;
    paused = true;
    play() { this.plays++; this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  const video = new Video();
  const record = { locks: 0, unlocks: 0, progress: [], finishes: [], states: [] };
  const pending = new Map();
  let timerId = 0;
  const hooks = {
    lock() { record.locks++; }, unlock() { record.unlocks++; },
    state(value) { record.states.push(value); }, progress(value) { record.progress.push(value); },
    finish(value) { record.finishes.push(value); }, ready() {}, reset() {},
  };
  const player = sandbox.window.SigariStoryPlayback(video, hooks, {
    setTimeout(callback) { pending.set(++timerId, callback); return timerId; },
    clearTimeout(id) { pending.delete(id); },
  });
  return { video, player, record, pending };
}

test('arrival locks without playing; one start plays once until native ended', () => {
  const { video, player, record } = fixture();
  player.arm();
  assert.equal(player.phase, 'armed');
  assert.equal(record.locks, 1);
  assert.equal(video.plays, 0);
  player.start();
  video.currentTime = .8;
  video.dispatchEvent(new Event('timeupdate'));
  player.start();
  assert.equal(video.plays, 1);
  assert.equal(video.currentTime, .8, 'extra gestures must not restart or seek playback');
  assert.equal(player.locked, true);
  assert.equal(record.unlocks, 0);
  video.currentTime = 1.9;
  video.dispatchEvent(new Event('ended'));
  assert.equal(player.phase, 'complete');
  assert.equal(record.unlocks, 1);
  assert.equal(record.progress.at(-1), 1);
  video.dispatchEvent(new Event('ended'));
  assert.equal(record.unlocks, 1);
});

test('a media error releases an active scroll lock', () => {
  const { video, player, record } = fixture();
  player.arm(); player.start();
  video.dispatchEvent(new Event('error'));
  assert.equal(player.locked, false);
  assert.equal(record.unlocks, 1);
  assert.equal(record.finishes.at(-1), 'error');
});

test('stalled media cannot trap the visitor indefinitely', () => {
  const { player, record, pending } = fixture();
  player.arm(); player.start();
  [...pending.values()][0]();
  assert.equal(player.locked, false);
  assert.equal(record.finishes.at(-1), 'timeout');
  assert.equal(record.unlocks, 1);
});

test('upward navigation or Escape can leave an armed scene without playing', () => {
  const { video, player, record } = fixture();
  player.arm(); player.cancel('back');
  assert.equal(video.plays, 0);
  assert.equal(player.locked, false);
  assert.equal(record.unlocks, 1);
});

test('blocked playback promises release the page', async () => {
  const { video, player, record } = fixture();
  video.play = () => Promise.reject(new Error('Playback denied'));
  player.arm(); player.start();
  await Promise.resolve();
  assert.equal(player.locked, false);
  assert.equal(record.finishes.at(-1), 'error');
});

test('destruction unlocks and disconnects media callbacks', () => {
  const { video, player, record } = fixture();
  player.arm(); player.start(); player.destroy();
  const count = record.progress.length;
  video.dispatchEvent(new Event('timeupdate'));
  assert.equal(record.progress.length, count);
  assert.equal(record.unlocks, 1);
});

test('a preload error never locks the page; an explicit retry can reset it', () => {
  const { video, player, record } = fixture();
  video.dispatchEvent(new Event('error'));
  assert.equal(player.arm(), false);
  assert.equal(record.locks, 0);
  player.reset(); player.arm();
  assert.equal(player.phase, 'armed');
  assert.equal(record.locks, 1);
});

test('a segment stops at the outfit boundary and preserves its displayed frame for the return', () => {
  const { video, record } = fixture();
  const frames = new Map();
  let nextFrame = 0;
  let player;
  const hooks = {
    lock() { assert.equal(player.locked, true, 'scroll callbacks must observe the lock before positioning'); },
    unlock() { record.unlocks++; }, state() {}, ready() {}, reset() {},
    finish(reason) { record.finishes.push(reason); }, progress(value) { record.progress.push(value); },
  };
  player = sandbox.window.SigariStoryPlayback(video, hooks, {
    setTimeout() { return 1; }, clearTimeout() {},
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  const tick = () => { const [id, callback] = frames.entries().next().value; frames.delete(id); callback(); };
  player.start({ from: 0, to: .75 });
  video.currentTime = .4;
  tick();
  assert.ok(Math.abs(record.progress.at(-1) - .4 / .75) < .001);
  video.currentTime = .75;
  tick();
  assert.equal(player.phase, 'complete');
  assert.equal(video.paused, true);
  assert.equal(record.unlocks, 1);
  const progressCount = record.progress.length;
  player.reset({ preserveFrame: true });
  assert.equal(video.currentTime, .75);
  assert.equal(record.progress.length, progressCount, 'reset must not flash the initial copy');
  player.start({ from: .75, to: 1.5 });
  assert.equal(video.currentTime, .75);
  video.currentTime = 1.5;
  tick();
  assert.equal(player.phase, 'complete');
  assert.equal(record.unlocks, 2);
  assert.deepEqual(record.finishes, ['ended', 'ended']);
});
