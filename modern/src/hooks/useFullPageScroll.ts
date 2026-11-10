"use client";
import {useEffect,useRef,useState} from 'react';
import type {ScrollController,ScrollState} from '@/lib/scroll-controller';
import type {StoryController} from '@/lib/story-controller';
import {homeSections} from '@/lib/home-sections';
const natural:ScrollState={mode:'natural',currentSection:0,targetSection:0,isTransitioning:false,count:homeSections.length};
const preferenceKey='sigari:home-scroll-mode';
export function useFullPageScroll(){
  const main=useRef<HTMLElement>(null);
  const controller=useRef<ScrollController|null>(null);
  const resume=useRef<HTMLElement|null>(null);
  const [state,setState]=useState<ScrollState>(natural);
  const [enabled,setEnabled]=useState<boolean|null>(null);
  const [canRestore,setCanRestore]=useState(false);
  useEffect(()=>{
    let presentation=true;
    try{presentation=localStorage.getItem(preferenceKey)!=='free';}catch{/* Storage can be unavailable. */}
    setEnabled(presentation);
  },[]);
  useEffect(()=>{
    if(enabled===null)return;
    const element=main.current!;
    const shell=element.closest<HTMLElement>('#page-shell')!;
    const storyRoot=element.querySelector<HTMLElement>('.story-section')!;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const mobile=matchMedia('(max-width: 1024px)');
    const panels=Array.from(element.querySelectorAll<HTMLElement>(':scope > section'));
    const footer=shell.querySelector<HTMLElement>('.site-footer')!;
    footer.id='home-footer';
    const ids=homeSections.map(section=>section.id);
    panels.forEach((panel,index)=>{panel.id||=ids[index];panel.dataset.fullpageSection=String(index);});
    let disposed=false,generation=0,story:StoryController|undefined,timer:ReturnType<typeof setTimeout>|undefined;
    const originalRestoration=history.scrollRestoration;
    function panelsFit(){return panels.every(panel=>{
      const bounds=panel.getBoundingClientRect();
      if(bounds.height>innerHeight+2)return false;
      if(panel.id==='contact'&&bounds.height+footer.offsetHeight>innerHeight+2)return false;
      // Ignore deliberately overflowing decorative glows/leaves and pseudo-elements.
      return Array.from(panel.querySelectorAll<HTMLElement>('.container,.story-state')).every(node=>{
        if(!node.getClientRects().length)return true;
        const box=node.getBoundingClientRect();const clip=node.classList.contains('story-state')?node.closest('.story-card')!.getBoundingClientRect():bounds;
        return box.top>=clip.top-2&&box.bottom<=clip.bottom+2;
      });
    });}
    function teardown(){
      controller.current?.destroy();controller.current=null;story?.destroy();story=undefined;
      shell.classList.remove('presentation-candidate','presentation-active');
      document.documentElement.classList.remove('fullpage-enabled');
      history.scrollRestoration=originalRestoration;
      shell.scrollTop=0;
      shell.style.removeProperty('--home-footer-height');
    }
    const setup=async()=>{
      const version=++generation;
      const oldActive=panels[Number(shell.dataset.currentSection??0)];
      const wasActive=shell.classList.contains('presentation-active');
      teardown();
      element.dataset.scrollMode='natural';setState(natural);
      setCanRestore(!enabled&&!preference.matches&&!mobile.matches&&innerHeight>=600);
      const staticStory=preference.matches||mobile.matches||!enabled;
      storyRoot.querySelector<HTMLElement>('.story-scroll')!.hidden=staticStory;
      storyRoot.querySelector<HTMLElement>('.story-static')!.hidden=!staticStory;
      if(wasActive&&!disposed)window.scrollTo({top:Math.max(0,oldActive.getBoundingClientRect().top+scrollY-100),behavior:'instant'});
      if(resume.current?.isConnected){
        const header=document.querySelector('.site-header')?.getBoundingClientRect().height??100;
        window.scrollTo({top:Math.max(0,resume.current.getBoundingClientRect().top+scrollY-header),behavior:'instant'});
        resume.current=null;
      }
      if(staticStory)return;
      const [{gsap},{Observer},{ScrollTrigger},{mountStory},{createScrollController}]=await Promise.all([
        import('gsap'),import('gsap/Observer'),import('gsap/ScrollTrigger'),import('@/lib/story-controller'),import('@/lib/scroll-controller')
      ]);
      await document.fonts.ready;
      if(disposed||version!==generation)return;
      gsap.registerPlugin(Observer,ScrollTrigger);
      let fits=enabled&&innerWidth>=1025&&innerHeight>=600;
      if(fits){
        shell.classList.add('presentation-candidate');
        shell.style.setProperty('--home-footer-height',`${footer.offsetHeight}px`);
        // Measure actual content after applying the presentation layout. Never crop.
        fits=panelsFit();
      }
      if(!fits){shell.classList.remove('presentation-candidate');story=mountStory(storyRoot,gsap,ScrollTrigger);return;}
      shell.classList.add('presentation-active');document.documentElement.classList.add('fullpage-enabled');
      window.scrollTo({top:0,behavior:'instant'});history.scrollRestoration='manual';
      element.dataset.scrollMode='fullpage';
      story=mountStory(storyRoot,gsap,ScrollTrigger,{managed:true});
      controller.current=createScrollController(shell,panels,story,gsap,Observer,ScrollTrigger,s=>{if(!disposed)setState(s);});
    };
    const resize=()=>{clearTimeout(timer);timer=setTimeout(()=>{void setup();},180);};
    const layout=()=>{if(controller.current&&!panelsFit())void setup();};
    const show=()=>controller.current?.refresh();
    window.addEventListener('resize',resize);window.addEventListener('pageshow',show);preference.addEventListener('change',resize);mobile.addEventListener('change',resize);element.addEventListener('toggle',layout,true);
    void setup();
    return()=>{disposed=true;generation++;clearTimeout(timer);window.removeEventListener('resize',resize);window.removeEventListener('pageshow',show);preference.removeEventListener('change',resize);mobile.removeEventListener('change',resize);element.removeEventListener('toggle',layout,true);teardown();history.scrollRestoration=originalRestoration;delete element.dataset.scrollMode;panels.forEach(p=>delete p.dataset.fullpageSection);};
  },[enabled]);
  function setMode(presentation:boolean){
    try{localStorage.setItem(preferenceKey,presentation?'presentation':'free');}catch{/* The control also works without storage. */}
    if(presentation){
      const panels=Array.from(main.current?.querySelectorAll<HTMLElement>(':scope > section')??[]);
      const center=innerHeight/2;
      const panel=panels.find(section=>{const rect=section.getBoundingClientRect();return rect.top<=center&&rect.bottom>center;});
      if(panel)history.replaceState(history.state,'','#'+panel.id);
    }else{
      resume.current=main.current?.querySelector<HTMLElement>('[data-fullpage-section][data-active="true"]')??null;
    }
    setEnabled(presentation);
  }
  return {main,state,canRestore,freeReading:enabled===false,next:()=>controller.current?.nextSection(),previous:()=>controller.current?.previousSection(),goTo:(index:number)=>controller.current?.goToSection(index),setMode};
}
