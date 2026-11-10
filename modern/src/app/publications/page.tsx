import Link from 'next/link';
import {PageIntro} from '@/components/layout/PageIntro';
import {PublicationFilters} from '@/components/publications/PublicationFilters';
import {verifiedPublications} from '@/lib/content';
import {pageMetadata} from '@/lib/seo';

export const metadata = pageMetadata('پژوهش‌ها و مقالات', 'آرشیو پژوهش‌های ثبت‌شده با نام Pouyan Sigari؛ جست‌وجو و فیلتر بر اساس حوزهٔ پژوهش و سال انتشار.', '/publications/');

export default function Publications() {
  return (
    <main id="main" tabIndex={-1} className="interior publications-page">
      <div className="container editorial-spread">
        <PageIntro title="در امتداد پرسش و پژوهش" description="گزیده‌ای از پژوهش‌های ثبت‌شده با نام Pouyan Sigari" label="پژوهش‌ها و مقالات" path="/publications/">
          <Link prefetch={false} className="text-link" href="/blog/">نوشته‌های تحریریه ←</Link>
        </PageIntro>
        <section className="spread-content">
          <h2 className="sr-only">آرشیو علمی</h2>
          <PublicationFilters items={verifiedPublications}/>
          <p className="editorial-note">مشخصات کتاب‌شناختی از صفحات ناشران گردآوری شده است. برای چکیده و متن پژوهش، پیوند ناشر هر مقاله را ببینید.</p>
        </section>
      </div>
      <div className="container page-actions"><Link prefetch={false} className="button" href="/contact/">تماس با مطب</Link></div>
    </main>
  );
}
