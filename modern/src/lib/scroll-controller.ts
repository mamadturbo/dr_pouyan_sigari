import type {gsap} from 'gsap';
import type {Observer} from 'gsap/Observer';
import type {ScrollTrigger} from 'gsap/ScrollTrigger';
import type {StoryController} from './story-controller';
import {GestureSession} from './gesture-session';
export type ScrollState={mode:'natural'|'fullpage';currentSection:number;targetSection:number;isTransitioning:boolean;count:number};
export type ScrollController={goToSection(index:number):void;nextSection():void;previousSection():void;refresh():void;destroy():void};
export function createScrollController(shell:HTMLElement,panels:HTMLElement[],story:StoryController,animation:typeof gsap,Input:typeof Observer,triggers:typeof ScrollTrigger,update:(state:ScrollState)=>void):ScrollController {
  const gate=new GestureSession();
  const footer=shell.querySelector<HTMLElement>('.site-footer');
  const footerInert=footer?.inert??false;
  const experiencePanel=panels.find(panel=>panel.id==='experience');
  let experienceTimer:ReturnType<typeof setTimeout>|undefined;
  const storyIndex=panels.findIndex(panel=>panel.id==='about');
  let currentSection=0,targetSection=0,isTransitioning=false,disposed=false;
  let tween:gsap.core.Tween|undefined;
  let guardFrame=0;
  const original=panels.map(panel=>({inert:panel.inert,tabindex:panel.getAttribute('tabindex')}));
  const position=(index:number)=>panels[index].getBoundingClientRect().top-shell.getBoundingClientRect().top+shell.scrollTop;
  const busy=()=>isTransitioning||story.locked;
  const menuOpen=()=>document.querySelector('.menu-toggle')?.getAttribute('aria-expanded')==='true';
  function publish(){
    shell.dataset.currentSection=String(currentSection);shell.dataset.targetSection=String(targetSection);shell.dataset.transitioning=String(busy());
    panels.forEach((panel,index)=>{panel.inert=index!==currentSection;panel.dataset.active=String(index===currentSection);});
    if(footer)footer.inert=currentSection!==panels.length-1;
    update({mode:'fullpage',currentSection,targetSection,isTransitioning:busy(),count:panels.length});
  }
  function settle(index:number,focus=true){
    currentSection=targetSection=index;isTransitioning=false;shell.scrollTop=position(index);
    publish();
    if(focus){panels[index].setAttribute('tabindex','-1');panels[index].focus({preventScroll:true});history.replaceState(history.state,'','#'+panels[index].id);}
  }
  function goToSection(index:number){
    if(disposed||busy()||menuOpen())return;
    index=Math.max(0,Math.min(panels.length-1,index));if(index===currentSection)return;
    targetSection=index;isTransitioning=true;publish();
    tween=animation.to(shell,{scrollTop:position(index),duration:.95,ease:'power3.inOut',overwrite:true,onUpdate:()=>triggers.update(),onComplete:()=>settle(index)});
  }
  function request(direction:number){
    if(!direction||busy()||menuOpen())return;
    if(panels[currentSection]===experiencePanel&&experiencePanel){
      const event=new CustomEvent('sigari:experience-step',{detail:direction,cancelable:true});
      if(!experiencePanel.dispatchEvent(event)){
        isTransitioning=true;publish();
        experienceTimer=setTimeout(()=>{isTransitioning=false;publish();},520);
        return;
      }
    }
    if(currentSection===storyIndex&&story.step(direction)){publish();return;}
    goToSection(currentSection+direction);
  }
  const observer=Input.create({id:'sigari-fullpage',target:shell,type:'wheel,touch',preventDefault:true,allowClicks:true,debounce:false,lockAxis:true,dragMinimum:12,
    ignore:'input,textarea,select,[contenteditable="true"],[data-native-scroll]',
    onWheel(self){const event=self.event as WheelEvent;if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
      const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?shell.clientHeight:1);
      request(gate.wheel(pixels,performance.now(),busy()||menuOpen()));},
    onPress(){gate.press(busy()||menuOpen());},
    onDrag(self){if(self.axis==='x')return;request(gate.touch((self.startY??0)-(self.y??0),busy()||menuOpen()));}
  });
  const preserveZoom=(event:WheelEvent)=>{if(event.ctrlKey)event.stopImmediatePropagation();};
  shell.addEventListener('wheel',preserveZoom,{capture:true,passive:true});
  function onKey(event:KeyboardEvent){
    const target=event.target as HTMLElement;
    if(menuOpen()||event.ctrlKey||event.altKey||event.metaKey||(!shell.contains(target)&&target!==document.body))return;
    if(target.closest('input,textarea,select,[contenteditable="true"]')||((event.key===' '||event.key==='Enter')&&target.closest('button,a,summary')))return;
    if(event.key==='Escape'){if(isTransitioning){tween?.kill();settle(targetSection);}story.cancel();publish();return;}
    const direction=['ArrowDown','PageDown'].includes(event.key)||(event.key===' '&&!event.shiftKey)?1:['ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey)?-1:0;
    if(direction||event.key==='Home'||event.key==='End'){
      event.preventDefault();if(event.repeat||busy())return;
      if(event.key==='Home')goToSection(0);else if(event.key==='End')goToSection(panels.length-1);else request(direction);
    }
  }
  function onClick(event:MouseEvent){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=(event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');if(!link)return;
    const id=link.getAttribute('href')!.slice(1);
    if(id==='main'){
      event.preventDefault();
      const panel=panels[currentSection];
      panel.tabIndex=-1;
      panel.focus({preventScroll:true});
      return;
    }
    const index=id==='top'?0:id==='home-footer'?panels.length-1:panels.findIndex(p=>p.id===id||p.querySelector('#'+CSS.escape(id)));
    if(index<0)return;event.preventDefault();goToSection(index);
  }
  function onFocus(event:FocusEvent){const panel=(event.target as HTMLElement).closest<HTMLElement>('[data-fullpage-section]');if(!panel)return;const index=panels.indexOf(panel);if(index>=0&&index!==currentSection&&!busy())goToSection(index);}
  function guard(){if(isTransitioning||disposed)return;cancelAnimationFrame(guardFrame);guardFrame=requestAnimationFrame(()=>{if(!isTransitioning&&!disposed)shell.scrollTop=position(currentSection);});}
  const onStory=()=>{if(!disposed)publish();};
  window.addEventListener('keydown',onKey);document.addEventListener('click',onClick);shell.addEventListener('focusin',onFocus);shell.addEventListener('scroll',guard,{passive:true});shell.addEventListener('sigari:story-state',onStory);
  let initialId='';try{initialId=decodeURIComponent(location.hash.slice(1));}catch{/* Ignore malformed fragments. */}
  const initial=initialId==='home-footer'?panels.length-1:panels.findIndex(p=>p.id===initialId||p.querySelector('#'+CSS.escape(initialId||'__none')));
  settle(Math.max(0,initial),false);
  return {goToSection,nextSection:()=>request(1),previousSection:()=>request(-1),refresh(){if(disposed)return;tween?.kill();settle(targetSection,false);story.refresh();triggers.refresh();},destroy(){
    disposed=true;clearTimeout(experienceTimer);if(footer)footer.inert=footerInert;tween?.kill();observer.kill();cancelAnimationFrame(guardFrame);
    shell.removeEventListener('wheel',preserveZoom,true);
    window.removeEventListener('keydown',onKey);document.removeEventListener('click',onClick);shell.removeEventListener('focusin',onFocus);shell.removeEventListener('scroll',guard);shell.removeEventListener('sigari:story-state',onStory);
    panels.forEach((p,index)=>{p.inert=original[index].inert;if(original[index].tabindex===null)p.removeAttribute('tabindex');else p.setAttribute('tabindex',original[index].tabindex!);delete p.dataset.active;});
    delete shell.dataset.currentSection;delete shell.dataset.targetSection;delete shell.dataset.transitioning;
  }};
}
