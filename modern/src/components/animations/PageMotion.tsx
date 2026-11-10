"use client";

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

const sectionHeadings = [
  '.spread-copy > h2',
  '.section-heading > h2',
  '.journey-heading > h2',
  '.contact-copy > h2',
  '.academic-spread h2',
  '.biography h2',
  '.archive > h2',
  '.service-detail section > h2',
  '.story-static h2',
].join(',');

const rows = [
  '.experience-card-list > li',
  '.academic-spread .timeline > li',
  '.faq-list > .faq-item',
  '.research-grid > .research-card',
].join(',');

const cards = [
  '.service-grid > .service-card',
  '.article-grid > .article-card',
  '.education-reading > .article-card',
  '.case-grid > .case-card',
  '.contact-details > .contact-phone',
  '.contact-details > .contact-location',
  '.journey-steps > li',
].join(',');

const frames = '.gallery-frames > .gallery-frame';
const portraits = '.profile-portrait > img, .story-static-portrait > img, .article-cover';
const groupedItems = [rows, cards].join(',');
const arrivals = [sectionHeadings, groupedItems, frames, portraits].join(',');
const overlap = [0, 50, 80, 100];
const anticipation = 20;

type ArrivalStyle = {
  from: Keyframe;
  rise: number;
  duration: number;
  delay: number;
};

type Arrival = {
  style: ArrivalStyle;
  animation?: Animation;
  edge?: EntryEdge;
};

type EntryEdge = 'top' | 'bottom';

function appearance(element: HTMLElement, rank: number): ArrivalStyle {
  let opacity: number;
  let rise = 0;
  let shift = 0;
  let duration: number;

  if (element.matches(sectionHeadings)) {
    opacity = .74;
    rise = 13;
    duration = 560;
  } else if (element.matches(portraits)) {
    opacity = .78;
    shift = 10;
    duration = 650;
  } else if (element.matches(frames)) {
    opacity = .66;
    duration = element.classList.contains('gallery-frame-feature') ? 565 : 420;
  } else if (element.matches(rows)) {
    opacity = .78;
    rise = rank === 0 ? 9 : 6;
    duration = rank === 0 ? 460 : 400;
  } else {
    opacity = .74;
    rise = rank === 0 ? 14 : 9;
    duration = rank === 0 ? 540 : 470;
  }

  return {
    from: {opacity, translate: shift || rise ? `${shift}px ${rise}px` : 'none'},
    rise,
    duration,
    delay: element.matches(groupedItems) ? overlap[Math.min(rank, overlap.length - 1)] : 0,
  };
}

function arrivalAnimation(element: HTMLElement, style: ArrivalStyle, easing: string, edge?: EntryEdge) {
  const from = edge === 'top' && style.rise ? {...style.from, translate: `0 ${-style.rise}px`} : style.from;
  return element.animate([from, {opacity: 1, translate: 'none'}], {
    id: 'clinic-arrival',
    duration: style.duration,
    delay: edge ? 0 : style.delay,
    easing,
    fill: edge ? 'both' : 'backwards',
  });
}

export function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector<HTMLElement>('#main');
    const shell = main?.closest<HTMLElement>('#page-shell');
    if (!main || !shell || !Element.prototype.animate) return;

    const header = document.querySelector('.site-header');
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const easing = getComputedStyle(main).getPropertyValue('--clinic-arrival-ease').trim();
    const pending = new Map<HTMLElement, Arrival>();
    const opening = new Map<HTMLElement, Animation>();
    const ranks = new Map<Element, number>();
    let frame = 0;
    let initial = !preference.matches;
    let wasFullpage = shell.classList.contains('presentation-active');
    let lastPosition = wasFullpage ? shell.scrollTop : window.scrollY;
    let incomingEdge: EntryEdge = 'bottom';

    // Only the original elements have an entrance. Filtering and sorting are immediate.
    for (const element of main.querySelectorAll<HTMLElement>(arrivals)) {
      const group = element.parentElement!;
      const rank = ranks.get(group) ?? 0;
      ranks.set(group, rank + 1);
      pending.set(element, {style: appearance(element, rank)});
    }

    function finish(element: HTMLElement) {
      pending.get(element)?.animation?.cancel();
      pending.delete(element);
      opening.get(element)?.cancel();
      opening.delete(element);
    }

    const sync = () => {
      frame = 0;
      if (preference.matches) return;

      const fullpage = shell.classList.contains('presentation-active');
      const position = fullpage ? shell.scrollTop : window.scrollY;
      const moved = fullpage === wasFullpage && position !== lastPosition;
      if (moved) incomingEdge = position > lastPosition ? 'bottom' : 'top';
      lastPosition = position;
      wasFullpage = fullpage;

      const shellBounds = fullpage ? shell.getBoundingClientRect() : null;
      const top = Math.max(shellBounds?.top ?? 0, header?.getBoundingClientRect().bottom ?? 0);
      const bottom = Math.min(shellBounds?.bottom ?? innerHeight, innerHeight);
      const target = shell.dataset.targetSection;
      const destination = fullpage && target !== undefined
        ? main.querySelector<HTMLElement>(`[data-fullpage-section="${target}"]`) : null;
      if (fullpage && !destination) return;
      const settled = target === shell.dataset.currentSection;
      const remaining = destination && shellBounds ? destination.getBoundingClientRect().top - shellBounds.top : 0;
      const atDocumentEnd = !fullpage && position + innerHeight >= document.documentElement.scrollHeight - 1;
      const onOpening = initial && !moved;
      initial = false;

      // Read every position before changing any animation styles.
      const updates: Array<() => void> = [];
      for (const [element, arrival] of pending) {
        if (!element.isConnected || element.contains(document.activeElement)) {
          updates.push(() => finish(element));
          continue;
        }
        if (!element.getClientRects().length) continue;
        if (destination && !destination.contains(element)) continue;

        const rect = element.getBoundingClientRect();
        // Remove the current visual translation from the measurement to avoid feedback.
        const progress = arrival.animation?.effect?.getComputedTiming().progress ?? 1;
        const rise = (arrival.edge === 'top' ? -1 : 1) * arrival.style.rise * (1 - progress);
        const elementTop = rect.top - rise;
        const elementBottom = rect.bottom - rise;
        const visibleHeight = Math.min(bottom, elementBottom) - Math.max(top, elementTop);

        if (onOpening && visibleHeight >= Math.min(rect.height * .25, 64)) {
          updates.push(() => {
            pending.delete(element);
            const animation = arrivalAnimation(element, arrival.style, easing);
            opening.set(element, animation);
            animation.onfinish = () => opening.delete(element);
          });
          continue;
        }

        if (visibleHeight > 0 && (destination ? settled : atDocumentEnd || (position <= 0 && incomingEdge === 'top'))) {
          updates.push(() => finish(element));
          continue;
        }
        if (elementBottom < top - anticipation || elementTop > bottom + anticipation) {
          if (arrival.animation) updates.push(() => {
            arrival.animation?.cancel();
            arrival.animation = undefined;
            arrival.edge = undefined;
          });
          continue;
        }

        const edge = arrival.edge ??= destination && !settled ? (remaining < 0 ? 'top' : 'bottom') : incomingEdge;
        const entered = edge === 'bottom' ? bottom - elementTop : elementBottom - top;
        // In presentation mode, spread the reveal through the panel's approach to its final position.
        const depthAtRest = entered + (edge === 'bottom' ? remaining : -remaining);
        const distance = destination
          ? Math.max(1, depthAtRest * .92)
          : Math.min((bottom - top) * .23, Math.max(rect.height * .55, 90));
        const next = Math.max(0, entered / distance);
        if (next >= 1) {
          updates.push(() => finish(element));
        } else {
          updates.push(() => {
            if (!arrival.animation) {
              arrival.animation = arrivalAnimation(element, arrival.style, easing, edge);
              arrival.animation.pause();
            }
            arrival.animation.currentTime = next * arrival.style.duration;
          });
        }
      }
      if (moved) opening.forEach((_, element) => updates.push(() => finish(element)));
      updates.forEach(update => update());
    };

    const schedule = () => {
      if (!frame && !preference.matches && pending.size) frame = requestAnimationFrame(sync);
    };
    const onPreference = () => {
      if (preference.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        initial = false;
        opening.forEach(animation => animation.cancel());
        opening.clear();
        pending.forEach(arrival => {
          arrival.animation?.cancel();
          arrival.animation = undefined;
          arrival.edge = undefined;
        });
      } else {
        schedule();
      }
    };
    const onFocus = (event: FocusEvent) => {
      for (const element of [...pending.keys(), ...opening.keys()]) {
        if (element.contains(event.target as Node)) finish(element);
      }
    };

    const mode = new MutationObserver(schedule);
    mode.observe(shell, {attributes: true, attributeFilter: ['class', 'data-target-section', 'data-current-section']});
    const layout = new ResizeObserver(schedule);
    layout.observe(main);
    layout.observe(document.documentElement);
    if (header) layout.observe(header);
    window.addEventListener('scroll', schedule, {passive: true});
    shell.addEventListener('scroll', schedule, {passive: true});
    preference.addEventListener('change', onPreference);
    main.addEventListener('focusin', onFocus);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      mode.disconnect();
      layout.disconnect();
      window.removeEventListener('scroll', schedule);
      shell.removeEventListener('scroll', schedule);
      preference.removeEventListener('change', onPreference);
      main.removeEventListener('focusin', onFocus);
      opening.forEach(animation => animation.cancel());
      pending.forEach(arrival => arrival.animation?.cancel());
    };
  }, [pathname]);

  return null;
}
