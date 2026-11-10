import Link from 'next/link';
import {ContactInformation} from '@/components/doctor/ContactInformation';
import {FAQ} from '@/components/doctor/FAQ';
import {pageMetadata} from '@/lib/seo';

export const metadata = pageMetadata('تماس با مطب', 'نشانی مطب دکتر پویان سیگاری در اردبیل، تلفن برای اطلاع از زمان پذیرش و شیوهٔ نوبت‌گیری و پیوند پروفایل نظام پزشکی.', '/contact/');

export default function Contact() {
  return (
    <main id="main" tabIndex={-1} className="interior contact-page">
      <ContactInformation page/>
      <section className="container editorial-spread faq-spread section-space">
        <div className="spread-copy">
          <p className="eyebrow">پرسش‌های متداول</p>
          <h2 className="section-title">شاید پرسش شما هم باشد</h2>
          <p className="section-description">پاسخ پرسش‌های رایج دربارهٔ نوبت، نشانی مطب و مقالات علمی.</p>
          <Link prefetch={false} className="text-link" href="/patient-guide/">راهنمای بیماران ←</Link>
        </div>
        <FAQ/>
      </section>
    </main>
  );
}
