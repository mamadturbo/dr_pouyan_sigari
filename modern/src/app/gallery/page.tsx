import Link from 'next/link';
import {PageIntro} from '@/components/layout/PageIntro';
import {CaseGallery} from '@/components/gallery/CaseGallery';
import {approvedCases} from '@/content/data/cases';
import {pageMetadata} from '@/lib/seo';

export const metadata = pageMetadata('نمونه‌کارها', 'گالری نمونه‌جراحی‌های دکتر پویان سیگاری؛ تصاویر قبل و بعد تنها پس از تأیید مجوز انتشار نمایش داده می‌شوند.', '/gallery/');

export default function Gallery() {
  return (
    <main id="main" tabIndex={-1} className="interior gallery-page">
      <div className="container editorial-spread">
        <PageIntro title="نمونه‌کارهای دکتر پویان سیگاری" description="تصاویر قبل و بعد، برای آشنایی با نتایج ثبت‌شدهٔ جراحی‌ها" label="گالری و نمونه‌کارها" path="/gallery/">
          {!approvedCases.length && <span className="status-pill">گالری در حال تکمیل است</span>}
        </PageIntro>
        <section className="spread-content">
          <h2 className="sr-only">گالری نمونه‌جراحی‌ها</h2>
          <CaseGallery items={approvedCases} filterable/>
          <p className="editorial-note">نتیجهٔ درمان برای هر فرد متفاوت است. برای بررسی شرایط خود، با مطب هماهنگ کنید.</p>
        </section>
      </div>
      <div className="container page-actions">
        <Link prefetch={false} className="text-link" href="/expertise/">آشنایی با خدمات ←</Link>
        <Link prefetch={false} className="button" href="/contact/">تماس با مطب</Link>
      </div>
    </main>
  );
}
