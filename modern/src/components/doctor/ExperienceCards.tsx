"use client";

import {useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft,ArrowUpLeft,BookOpen,GraduationCap,Mic,Presentation,X} from 'lucide-react';
import {experience} from '@/content/data/experience';

const highlights=[
  {record:experience[0],label:'آموزش و تدریس',Icon:GraduationCap},
  {record:experience[2],label:'سخنرانی علمی',Icon:Mic},
  {record:experience[3],label:'مسئولیت علمی',Icon:Presentation},
  {record:experience[6],label:'کنگره و تبادل دانش',Icon:BookOpen},
];

function Artwork({index,large=false}:{index:number;large?:boolean}){
  const {record,Icon}=highlights[index];
  return <span className={'experience-art'+(large?' experience-art-large':'')} data-variant={index} aria-hidden="true">
    <span className="experience-art-orbit"/><Icon strokeWidth={1.2}/>
    <span className="experience-art-year">{record.year}</span>
  </span>;
}

export function ExperienceCards(){
  const [selected,setSelected]=useState<number|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const panel=useRef<HTMLDivElement>(null);
  const triggers=useRef<(HTMLButtonElement|null)[]>([]);
  const animation=useRef<Animation|null>(null);
  const closing=useRef(false);

  function collapsedTransform(index:number){
    const from=triggers.current[index]?.getBoundingClientRect();
    const to=panel.current?.getBoundingClientRect();
    if(!from||!to)return 'scale(.96)';
    return `translate(${from.left+from.width/2-to.left-to.width/2}px,${from.top+from.height/2-to.top-to.height/2}px) scale(${from.width/to.width},${from.height/to.height})`;
  }

  useLayoutEffect(()=>{
    if(selected===null)return;
    const modal=dialog.current!;
    const trigger=triggers.current[selected];
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    closing.current=false;
    modal.showModal();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      animation.current=panel.current!.animate([
        {transform:collapsedTransform(selected),opacity:.5,borderRadius:'18px'},
        {transform:'none',opacity:1,borderRadius:'28px'},
      ],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
    }
    return()=>{
      animation.current?.cancel();
      modal.close();
      document.body.style.overflow=previousOverflow;
      // Restore focus after React removes the dialog from the top layer.
      requestAnimationFrame(()=>{if(trigger?.isConnected)trigger.focus({preventScroll:true});});
    };
  },[selected]);

  async function close(){
    if(selected===null||closing.current)return;
    closing.current=true;
    animation.current?.cancel();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      animation.current=panel.current!.animate([
        {transform:'none',opacity:1},
        {transform:collapsedTransform(selected),opacity:0},
      ],{duration:260,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
      await animation.current.finished.catch(()=>{});
    }
    setSelected(null);
  }

  const active=selected===null?null:highlights[selected];
  return <div className="experience-cards">
    <p className="experience-cards-hint">گزیده‌ای از حضورهای علمی <span>۱۳۹۶ — ۱۴۰۴</span></p>
    <ul className="experience-card-list">
      {highlights.map(({record,label},index)=><li key={record.title}>
        <button ref={node=>{triggers.current[index]=node;}} type="button" className="experience-card" onClick={()=>setSelected(index)} aria-haspopup="dialog">
          <Artwork index={index}/>
          <span className="experience-card-copy"><span className="experience-card-meta">{label}</span><span className="experience-card-title">{record.title}</span></span>
          <span className="experience-card-date">{record.year}</span><span className="experience-card-action" aria-hidden="true"><ArrowLeft size={19}/></span>
        </button>
      </li>)}
    </ul>
    <p className="experience-cards-footnote">برای آشنایی بیشتر، هر کارت را باز کنید.</p>
    {active&&createPortal(<dialog ref={dialog} className="experience-dialog" aria-labelledby="experience-dialog-title" aria-describedby="experience-dialog-description" onKeyDown={event=>{
      if(event.key!=='Tab')return;
      const controls=event.currentTarget.querySelectorAll<HTMLElement>('button,a[href]');
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }} onCancel={event=>{event.preventDefault();void close();}} onClick={event=>{if(event.target===event.currentTarget)void close();}}>
      <div ref={panel} className="experience-dialog-panel" data-native-scroll>
        <button type="button" className="experience-dialog-close" aria-label="بستن جزئیات سابقه" onClick={()=>void close()} autoFocus><X size={20}/></button>
        <Artwork index={selected!} large/>
        <div className="experience-dialog-body">
          <p className="experience-dialog-meta">{active.label}<span>{active.record.year}</span></p>
          <h2 id="experience-dialog-title">{active.record.title}</h2>
          <p id="experience-dialog-description">{active.record.text}</p>
          <a className="button experience-dialog-source" href={active.record.url} target="_blank" rel="noopener noreferrer">مشاهدهٔ گزارش و منبع <ArrowUpLeft size={18} aria-hidden="true"/></a>
        </div>
      </div>
    </dialog>,document.body)}
  </div>;
}
