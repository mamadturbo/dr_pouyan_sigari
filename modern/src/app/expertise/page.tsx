import Link from 'next/link';
import {PageIntro} from '@/components/layout/PageIntro';
import {ExpertiseGrid} from '@/components/doctor/ExpertiseCard';
import {expertise} from '@/content/data/expertise';
import {pageMetadata} from '@/lib/seo';

export const metadata = pageMetadata('خدمات و حوزه‌های تخصصی', 'آشنایی با حوزه‌های مستند تخصص دکتر پویان سیگاری و مسیر هماهنگی ارزیابی و مراجعه به مطب.', '/expertise/');

export default function Expertise() {
  return (
    <main id="main" tabIndex={-1} className="interior expertise-page">
      <div className="container editorial-spread spread-reverse">
        <PageIntro title="خدمات و حوزه‌های تخصصی" description="از آشنایی با حوزهٔ تخصص تا هماهنگی ارزیابی حضوری" label="حوزه‌های تخصصی و علمی" path="/expertise/">
          <Link prefetch={false} className="outline-action" href="/about/">آشنایی بیشتر با پزشک ←</Link>
        </PageIntro>
        <section className="spread-content">
          <h2 className="sr-only">حوزه‌های تخصصی</h2>
          <ExpertiseGrid/>
          <p className="editorial-note">زمینه‌های زیر بر اساس تخصص ثبت‌شده و سوابق پژوهشی و آموزشی معرفی شده‌اند. امکان ارائهٔ فعلی هر خدمت، محل درمان و روش مناسب را از مطب بپرسید.</p>
          <details className="service-evidence">
            <summary>تخصص و سوابق مرتبط</summary>
            {expertise.map(item => <div key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>)}
          </details>
        </section>
      </div>
      <div className="container page-actions">
        <Link prefetch={false} className="text-link" href="/gallery/">مشاهدهٔ نمونه‌کارها ←</Link>
        <Link prefetch={false} className="button" href="/contact/">تماس با مطب</Link>
      </div>
    </main>
  );
}
