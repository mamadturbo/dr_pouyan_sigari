"use client";

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ImageIcon, Images, X, ZoomIn} from 'lucide-react';
import type {PublicCase} from '@/lib/cases';
import {getService} from '@/content/data/services';

function Comparison({item, enlarged = false}: {item: PublicCase; enlarged?: boolean}) {
  return (
    <div className="case-comparison">
      {(['before', 'after'] as const).map(side => (
        <figure key={side}>
          <img {...item[side]} loading={enlarged ? 'eager' : 'lazy'}/>
          <figcaption>{side === 'before' ? 'قبل از درمان' : 'بعد از درمان'}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function CaseGallery({items, filterable = false}: {items: PublicCase[]; filterable?: boolean}) {
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<PublicCase | null>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const hasCases = items.length > 0;
  const filtered = items.filter(item => !category || item.category === category);
  const categories = [...new Set(items.map(item => item.category))];

  useEffect(() => {
    if (!selected) return;
    const dialog = modal.current!;
    const trigger = opener.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      trigger?.focus({preventScroll: true});
    };
  }, [selected]);

  return (
    <>
      {filterable && hasCases && (
        <>
          <div className="filters">
            <label>
              نوع جراحی
              <select value={category} onChange={event => setCategory(event.target.value)}>
                <option value="">همهٔ نمونه‌کارها</option>
                {categories.map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <p className="result-count" role="status">{filtered.length.toLocaleString('fa-IR')} نمونه‌جراحی</p>
        </>
      )}

      {filtered.length > 0 ? (
        <div className="case-grid">
          {filtered.map(item => (
            <article id={'case-' + item.id} className="case-card" key={item.id}>
              <Comparison item={item}/>
              <div className="case-copy">
                <p className="eyebrow">{item.category}</p>
                <h3>{item.title}</h3>
                <button
                  className="text-link"
                  type="button"
                  aria-label={'بزرگ‌نمایی ' + item.title}
                  onClick={event => {
                    opener.current = event.currentTarget;
                    setSelected(item);
                  }}
                >
                  <ZoomIn aria-hidden="true" size={18}/> بزرگ‌نمایی قبل و بعد
                </button>
                {(item.description || item.angle || item.interval) && (
                  <details>
                    <summary>جزئیات نمونه‌جراحی</summary>
                    {item.description && <p>{item.description}</p>}
                    {item.angle && <p>زاویهٔ تصویربرداری: {item.angle}</p>}
                    {item.interval && <p>زمان پس از درمان: {item.interval}</p>}
                  </details>
                )}
                <Link prefetch={false} className="text-link" href={'/expertise/' + item.relatedService + '/'}>
                  {getService(item.relatedService)!.title} ←
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state gallery-empty">
          {hasCases ? <Images aria-hidden="true" size={40}/> : (
            <div className="gallery-frames" aria-hidden="true">
              <div className="gallery-frame gallery-frame-feature"><ImageIcon/><span>محل نمایش نمونه‌کار</span></div>
              <div className="gallery-frame"><ImageIcon/></div>
              <div className="gallery-frame"><ImageIcon/></div>
            </div>
          )}
          <h3>{hasCases ? 'نمونه‌ای در این دسته وجود ندارد' : 'نمونه‌جراحی‌ها به‌زودی در دسترس خواهند بود'}</h3>
          <p>{hasCases
            ? 'دسته‌بندی دیگری را انتخاب کنید.'
            : 'در حال حاضر تصویر تأییدشده‌ای برای انتشار در سایت موجود نیست. تصاویر قبل و بعد پس از تأیید مجوز انتشار در این بخش قرار می‌گیرند.'}</p>
          {hasCases && <button className="filter-reset" type="button" onClick={() => setCategory('')}>نمایش همهٔ نمونه‌کارها</button>}
          <Link prefetch={false} className="text-link" href="/contact/">ارتباط با مطب ←</Link>
        </div>
      )}

      {/* The home presentation controller must not handle input inside the modal. */}
      {selected && createPortal(
        <dialog
          ref={modal}
          className="case-dialog"
          aria-labelledby="case-dialog-title"
          onCancel={() => setSelected(null)}
          onClick={event => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div className="case-dialog-content">
            <button className="case-close" type="button" aria-label="بستن تصاویر" onClick={() => setSelected(null)}>
              <X aria-hidden="true"/>
            </button>
            <h2 id="case-dialog-title">{selected.title}</h2>
            <Comparison item={selected} enlarged/>
            {selected.interval && <p>زمان پس از درمان: {selected.interval}</p>}
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}
