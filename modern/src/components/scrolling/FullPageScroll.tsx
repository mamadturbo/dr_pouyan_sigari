"use client";
import type {ReactNode} from 'react';
import {useState} from 'react';
import {ScrollModeContext} from './ScrollModeContext';
import {useFullPageScroll} from '@/hooks/useFullPageScroll';
import {homeSections} from '@/lib/home-sections';
export function FullPageScroll({children}:{children:ReactNode}){
  const {main,state,goTo,canRestore,freeReading,setMode}=useFullPageScroll();
  const [hoveredSection,setHoveredSection]=useState<number|null>(null);
  return <ScrollModeContext.Provider value={state.mode}><main id="main" tabIndex={-1} ref={main} data-reading-mode={freeReading?'free':undefined}>{children}<nav className="presentation-navigation" data-tone="light" aria-label="پیمایش بخش‌های صفحه" hidden={state.mode!=='fullpage'} onPointerLeave={()=>setHoveredSection(null)}>
    {homeSections.map(({label},index)=><button key={label} type="button" onClick={()=>goTo(index)}
      onPointerEnter={event=>{if(event.pointerType==='mouse')setHoveredSection(index);}}
      data-distance={Math.min(4,Math.abs(index-(hoveredSection??state.currentSection)))} aria-label={'بخش '+(index+1)+': '+label} aria-current={state.currentSection===index?'page':undefined}
      disabled={state.isTransitioning} title={label}>
      {new Intl.NumberFormat('fa-IR').format(index+1)}
    </button>)}
  </nav>{(state.mode==='fullpage'||canRestore)&&<button type="button" className="natural-scroll-control" onClick={()=>setMode(freeReading)}>{freeReading?'پیمایش بخش‌به‌بخش':'اسکرول آزاد'}</button>}</main></ScrollModeContext.Provider>;
}
