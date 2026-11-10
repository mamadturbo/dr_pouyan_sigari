"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Menu, X } from 'lucide-react';
import { doctor } from '@/content/data/doctor';
import {navigation} from '@/lib/navigation';
export {navigation} from '@/lib/navigation';
export function SiteHeader(){
  const [open,setOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const pathname=usePathname();
  const button=useRef<HTMLButtonElement>(null);
  const nav=useRef<HTMLElement>(null);
  useEffect(()=>{
    const onScroll=()=>setScrolled(scrollY>60);
    onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
    return ()=>window.removeEventListener('scroll',onScroll);
  },[]);
  useEffect(()=>{
    if(!open) return;
    const original=document.body.style.overflow;
    const shell=document.getElementById('page-shell');
    const originalInert=shell?.inert??false;
    const outside=Array.from(document.querySelectorAll<HTMLElement>('.header-inner > a,.skip-link'));
    const inertStates=outside.map(element=>element.inert);
    outside.forEach(element=>{element.inert=true;});
    if(shell)shell.inert=true;
    document.body.style.overflow='hidden';
    nav.current?.querySelector<HTMLAnchorElement>('a')?.focus({preventScroll:true});
    const close=()=>setOpen(false);
    const resize=()=>{if(innerWidth>1024) close();};
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){close();button.current?.focus();}
      if(event.key==='Tab'){
        const items=[button.current!,...Array.from(nav.current!.querySelectorAll<HTMLAnchorElement>('a'))];
        if(event.shiftKey && document.activeElement===items[0]) {event.preventDefault();items.at(-1)?.focus();}
        else if(!event.shiftKey && document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
      }
    };
    window.addEventListener('keydown',key);window.addEventListener('resize',resize);
    return ()=>{outside.forEach((element,index)=>{element.inert=inertStates[index];});if(shell)shell.inert=originalInert;document.body.style.overflow=original;window.removeEventListener('keydown',key);window.removeEventListener('resize',resize);};
  },[open]);
  const onContact=pathname.replace(/\/$/,'')==='/contact';
  const onResearch=pathname.replace(/\/$/,'')==='/publications';
  const closeOnNavigate=(event:MouseEvent<HTMLAnchorElement>)=>{
    if(!open||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    button.current?.focus({preventScroll:true});
    setOpen(false);
  };
  const links=navigation.map(([href,label])=><Link prefetch={false} key={href} href={href} onClick={closeOnNavigate} aria-current={
    (href==='/'?pathname==='/':pathname.startsWith(href)||pathname===href.slice(0,-1))?'page':href==='/blog/'&&onResearch?'location':undefined
  }>{label}</Link>);
  return <header className={'site-header '+(scrolled||open||pathname!=='/'?'is-scrolled':'')} data-home={pathname==='/'}>
    <div className="header-inner container"><Link prefetch={false} className="brand" href="/" onClick={()=>setOpen(false)}><span className="brand-mark">PS<span>✳</span></span><span>{doctor.name}<small>جراحی دهان، فک و صورت</small></span></Link>
    <nav className="desktop-nav" aria-label="منوی اصلی">{links}</nav>
    <Link prefetch={false} className="button button-small" href="/contact/" aria-current={onContact?'page':undefined}>تماس با مطب</Link>
    <button ref={button} className="menu-toggle" aria-label={open?'بستن منو':'باز کردن منو'} aria-expanded={open} aria-controls="mobile-nav" onClick={()=>setOpen(!open)}>{open?<X aria-hidden="true"/>:<Menu aria-hidden="true"/>}</button></div>
    <nav ref={nav} id="mobile-nav" className="mobile-nav" aria-label="منوی موبایل" hidden={!open}>{links}<Link prefetch={false} href="/contact/" onClick={closeOnNavigate} aria-current={onContact?'page':undefined}>تماس با مطب</Link></nav>
  </header>;
}
