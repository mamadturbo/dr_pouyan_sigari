"use client";
import {useState} from 'react';
import type {ArticleMetadata} from '@/types/content';
import {ArticleCard} from './ArticleCard';
export function ArticleFilters({items}:{items:ArticleMetadata[]}){
  const [category,setCategory]=useState('');
  const filtered=items.filter(item=>!category||item.category===category);
  return <><div className="filters"><label>دسته‌بندی مقاله<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">همهٔ نوشته‌ها</option>{[...new Set(items.map(a=>a.category))].map(c=><option key={c}>{c}</option>)}</select></label></div><p role="status" className="result-count">{filtered.length.toLocaleString('fa-IR')} نوشته</p><div className="article-grid">{filtered.map(a=><ArticleCard key={a.slug} article={a}/>)}</div>{!filtered.length&&<p className="empty-state">نوشته‌ای در این دسته وجود ندارد.</p>}</>;
}
