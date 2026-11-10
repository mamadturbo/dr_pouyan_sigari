"use client";
import {useContext,useEffect,useRef,useState} from 'react';
import { experience } from '@/content/data/experience';
import { Icon } from '@/components/ui/Icon';
import {ScrollModeContext} from '@/components/scrolling/ScrollModeContext';

export function EducationTimeline({progressive=false}:{progressive?:boolean}){
  // Four concise highlights preserve the existing home presentation; About lists every record.
  const highlights=[
    {...experience[0],text:'۲۱ اردیبهشت ۱۳۹۶؛ تدریس در دورهٔ اندو.'},
    {...experience[2],text:'۱۲ مرداد ۱۴۰۳؛ معرفی برای سخنرانی «اصول کلی جراحی ارتوگناتیک» در وبینار.'},
    {...experience[3],text:'۶ تا ۹ آذر ۱۴۰۳؛ معرفی به‌عنوان دبیر مشاور علمی تخصصی جراحی کنگرهٔ شانزدهم.'},
    {...experience[6],text:'۳۰ آبان ۱۴۰۴؛ معرفی برای سخنرانی دربارهٔ جراحی ایمپلنت و سینوس در کنگرهٔ هفدهم.'}
  ];
  const entries=progressive?highlights:experience;
  const root=useRef<HTMLOListElement>(null);
  const [active,setActive]=useState(0);
  const mode=useContext(ScrollModeContext);
  const paged=progressive&&mode==='fullpage';
  const current=useRef(0);
  function select(index:number){
    current.current=index;setActive(index);
  }
  useEffect(()=>{
    if(!paged)return;
    let disposed=false;
    let cleanup=()=>{};
    void import('gsap').then(({gsap})=>{
      if(disposed)return;
      const media=gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)',()=>{
        const detail=root.current?.querySelector('li[data-current=true] .timeline-detail');
        if(detail)gsap.fromTo(detail,{y:-8,opacity:.7},{y:0,opacity:1,duration:.28,ease:'power2.out',clearProps:'transform,opacity'});
      });
      cleanup=()=>media.revert();
    }).catch(()=>{/* The selected detail is already visible without animation. */});
    return()=>{disposed=true;cleanup();};
  },[paged,active]);
  useEffect(()=>{
    if(!paged)return;
    const panel=root.current!.closest<HTMLElement>('section')!;
    const step=(event:Event)=>{
      const direction=(event as CustomEvent<number>).detail;
      const next=current.current+direction;
      if(next<0||next>=entries.length)return;
      event.preventDefault();select(next);
    };
    panel.addEventListener('sigari:experience-step',step);
    return()=>panel.removeEventListener('sigari:experience-step',step);
  },[paged,entries.length]);
  return <div className={paged?'experience-stages':'experience-list'}>
    <ol ref={root} className={'timeline'+(paged?' timeline-progressive':'')} data-stage={active}>
      {entries.map((item,index)=><li key={item.title} data-current={active===index}>
        <span className="timeline-year">{item.year}</span>
        <h3>{paged?<button type="button" onClick={()=>select(index)} aria-expanded={active===index} aria-controls={'experience-detail-'+index}>{item.title}</button>:item.title}</h3>
        <div id={'experience-detail-'+index} className="timeline-detail" hidden={paged&&active!==index}>
          <p>{item.text}</p><div className="timeline-sources"><a href={item.url} target="_blank" rel="noopener noreferrer">گزارش و منبع <Icon name="external"/></a>{item.extraUrl&&<a href={item.extraUrl} target="_blank" rel="noopener noreferrer">منبع تکمیلی <Icon name="external"/></a>}</div>
        </div>
      </li>)}
    </ol>

  </div>;
}
