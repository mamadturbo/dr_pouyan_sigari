import Link from 'next/link';
import {approvedCases} from '@/content/data/cases';
import {CaseGallery} from '@/components/gallery/CaseGallery';

export function DoctorPortfolio() {
  const featured = [
    ...approvedCases.filter(item => item.featured),
    ...approvedCases.filter(item => !item.featured),
  ].slice(0, 6);

  return (
    <section id="portfolio" className="portfolio-section section-space" aria-labelledby="portfolio-title">
      {/* Preserve the fragment used by the previous homepage gallery. */}
      <div className="container editorial-spread" id="journey">
        <div className="spread-copy">
          <p className="eyebrow">گالری و نمونه‌کارها</p>
          <h2 id="portfolio-title" className="section-title">نمونه‌جراحی‌های منتخب</h2>
          <Link prefetch={false} className="outline-action" href="/gallery/">مشاهده همهٔ نمونه‌کارها ←</Link>
        </div>
        <CaseGallery items={featured}/>
      </div>
    </section>
  );
}
