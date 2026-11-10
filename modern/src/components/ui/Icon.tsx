import type { CSSProperties } from 'react';
export function Icon({name, className = ''}: {name: string; className?: string}) { return <svg className={'icon '+className} aria-hidden="true"><use href={'#i-'+name}/></svg>; }
export function IconSprite(){ return (<svg className="icon-sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M20 12H4m6-6-6 6 6 6"/></symbol>
  <symbol id="i-down" viewBox="0 0 24 24"><path d="M12 4v16m-6-6 6 6 6-6"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path d="m8 3 3 5-3 3a15 15 0 0 0 5 5l3-3 5 3c-1 5-4 5-7 4C8 18 3 13 3 7c0-3 2-4 5-4Z"/></symbol>
  <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 11h16m-12 4h3m-3 3h6"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></symbol>
  <symbol id="i-chat" viewBox="0 0 24 24"><path d="M21 11a8 8 0 0 1-8 8H6l-4 3 1-7a8 8 0 0 1-1-4 9 9 0 0 1 19 0Z"/><path d="M7 10h.01M12 10h.01M17 10h.01"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M12 5c-3-2-7-2-10-1v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v16M5 8h3m-3 4h3m8-4h3m-3 4h3"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 21S2 15 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 7-10 13-10 13Z"/></symbol>
  <symbol id="i-tooth" viewBox="0 0 32 32"><path d="M16 7C7 1 3 7 5 14l3 11c1 5 4 4 5 0l1-5c.5-3 3.5-3 4 0l1 5c1 4 4 5 5 0l3-11c2-7-2-13-11-7Z"/><path d="M13 6c1 2 3 3 6 3"/></symbol>
  <symbol id="i-bone" viewBox="0 0 32 32"><path d="M9 5a4 4 0 0 0-7 3c-1 3 1 6 4 6l12 12c0 3 3 5 6 4a4 4 0 0 0 3-7 4 4 0 0 0-3-7L12 4c0-3-5-4-6-1"/><path d="m12 12 8 8"/></symbol>
  <symbol id="i-implant" viewBox="0 0 32 32"><path d="M10 13C3 2 11 1 16 4c5-3 13-2 6 9H10Zm2 0 1 16h6l1-16M11 17h10m-9 5h8m-7 4h6"/></symbol>
  <symbol id="i-profile" viewBox="0 0 32 32"><path d="M8 29v-6C-1 12 8 1 19 3c7 1 6 8 7 10l3 5-4 1v5c0 3-5 3-8 2v3M17 12h4m-5 10h8"/></symbol>
  <symbol id="i-eye" viewBox="0 0 32 32"><path d="M2 16S7 7 16 7s14 9 14 9-5 9-14 9S2 16 2 16Zm3-11 3 3m8-7v4m11 0-3 3"/><circle cx="16" cy="16" r="4"/></symbol>
  <symbol id="i-layers" viewBox="0 0 32 32"><path d="m16 3 14 8-14 8L2 11 16 3Zm-14 15 14 8 14-8M2 24l14 7 14-7"/></symbol>
  <symbol id="i-external" viewBox="0 0 24 24"><path d="M9 5H5v14h14v-4M13 3h8v8m0-8L10 14"/></symbol>
  <symbol id="i-instagram" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
</svg>

); }
