"use client";
import { useEffect, useRef, useState } from 'react';
import type { Publication } from '@/types/content';
import { filterPublications } from '@/lib/publications';
import { PublicationCard } from './PublicationCard';

type Filters = { category: string; query: string; order: 'newest' | 'oldest' };
const defaults: Filters = { category: '', query: '', order: 'newest' };

export function PublicationFilters({ items }: { items: Publication[] }) {
  const categories = [...new Set(items.map(item => item.category))];
  const [{ category, query, order }, setFilters] = useState(defaults);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const readUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const topic = params.get('topic');
      setFilters({
        category: topic && items.some(item => item.category === topic) ? topic : '',
        query: params.get('q') ?? '',
        order: params.get('sort') === 'oldest' ? 'oldest' : 'newest',
      });
    };
    readUrl();
    window.addEventListener('popstate', readUrl);
    return () => window.removeEventListener('popstate', readUrl);
  }, [items]);

  const updateFilters = (patch: Partial<Filters>) => {
    const next = { category, query, order, ...patch };
    setFilters(next);
    const url = new URL(window.location.href);
    for (const [key, value] of [
      ['topic', next.category],
      ['q', next.query.trim()],
      ['sort', next.order === defaults.order ? '' : next.order],
    ]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (url.href !== window.location.href) window.history.replaceState(null, '', url);
  };
  const reset = () => {
    updateFilters(defaults);
    search.current?.focus();
  };
  const result = filterPublications(items, category, query, order);
  const hasFilters = Boolean(category || query || order !== defaults.order);

  return <>
    <div className="filters publication-filters" role="group" aria-label="جست‌وجو و فیلتر پژوهش‌ها">
      <label>جست‌وجوی پژوهش
        <input ref={search} type="search" name="q" value={query} autoComplete="off"
          onChange={event => updateFilters({ query: event.target.value })}
          placeholder="مثلاً ایمپلنت یا ۲۰۱۹" />
      </label>
      <label>حوزهٔ پژوهش
        <select name="topic" value={category} onChange={event => updateFilters({ category: event.target.value })}>
          <option value="">همهٔ حوزه‌ها</option>
          {categories.map(topic => <option key={topic}>{topic}</option>)}
        </select>
      </label>
      <label>ترتیب نمایش
        <select name="sort" value={order} onChange={event => updateFilters({ order: event.target.value === 'oldest' ? 'oldest' : 'newest' })}>
          <option value="newest">جدیدترین</option>
          <option value="oldest">قدیمی‌ترین</option>
        </select>
      </label>
    </div>
    <div className="publication-results-bar">
      <p className="result-count" role="status">{result.length.toLocaleString('fa-IR')} پژوهش</p>
      {hasFilters && <button type="button" className="filter-reset" onClick={reset}>پاک کردن فیلترها</button>}
    </div>
    {result.length ? <div className="research-grid">{result.map(item => <PublicationCard key={item.id} item={item} />)}</div> :
      <div className="empty-state">
        <p>پژوهشی با این مشخصات پیدا نشد. عبارت یا حوزهٔ جست‌وجو را تغییر دهید.</p>
        <button className="filter-reset" type="button" onClick={reset}>نمایش همهٔ پژوهش‌ها</button>
      </div>}
  </>;
}
