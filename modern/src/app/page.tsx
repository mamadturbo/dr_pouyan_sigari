import Link from 'next/link';
import {FullPageScroll} from '@/components/scrolling/FullPageScroll';
import {DoctorHero} from '@/components/home/DoctorHero';
import {DoctorStory} from '@/components/animations/DoctorStory';
import {DoctorPortfolio} from '@/components/home/DoctorPortfolio';
import {PatientJourney} from '@/components/home/PatientJourney';
import {ExperienceCards} from '@/components/doctor/ExperienceCards';
import {ExpertiseGrid} from '@/components/doctor/ExpertiseCard';
import {ContactInformation} from '@/components/doctor/ContactInformation';
import {FAQ} from '@/components/doctor/FAQ';
import {ArticleCard} from '@/components/blog/ArticleCard';
import {JsonLd} from '@/components/ui/JsonLd';
import {publishedArticles} from '@/lib/content';
import {pageMetadata, personSchema, absolute} from '@/lib/seo';

export const metadata = pageMetadata('جراحی دهان، فک و صورت در اردبیل', 'دکتر پویان سیگاری؛ آشنایی با پزشک، نمونه‌جراحی‌های تأییدشده، خدمات، راهنمای بیماران و اطلاعات تماس مطب در اردبیل.', '/');

export default function Home() {
  return (
    <FullPageScroll>
      <JsonLd data={personSchema}/>
      <JsonLd data={{'@context': 'https://schema.org', '@type': 'WebSite', name: 'دکتر پویان سیگاری', url: absolute('/'), inLanguage: 'fa-IR'}}/>
      <DoctorHero/>
      <section className="experience-section section-space" id="experience">
        <div className="container editorial-spread">
          <div className="spread-copy">
            <p className="eyebrow">آموزش و فعالیت علمی</p>
            <h2 className="section-title">دانشی که به اشتراک گذاشته می‌شود.</h2>
            <p className="section-description">دارای تخصص و بورد جراحی دهان، فک و صورت، ثبت‌شده در نظام پزشکی؛ همراه با سوابق تاریخ‌دار آموزش و پژوهش.</p>
            <Link prefetch={false} className="outline-action" href="/about/">مدارک و مسیر علمی پزشک ←</Link>
          </div>
          <ExperienceCards/>
        </div>
      </section>
      <DoctorPortfolio/>
      <section className="services-section section-space" id="services">
        <div className="container editorial-spread spread-reverse">
          <div className="spread-copy">
            <p className="eyebrow">حوزه‌های تخصصی و علمی</p>
            <h2 className="section-title">خدمات و حوزه‌های تخصصی</h2>
            <p className="section-description">امکان ارائهٔ هر خدمت و روش مناسب پس از بررسی شرایط شما مشخص می‌شود.</p>
            <Link prefetch={false} className="outline-action" href="/expertise/">آشنایی با خدمات ←</Link>
          </div>
          <ExpertiseGrid/>
        </div>
      </section>
      <DoctorStory/>
      <PatientJourney/>
      <section className="faq-section section-space education-section" id="research">
        <div className="container editorial-spread faq-spread">
          <div className="spread-copy">
            <p className="eyebrow">پرسش‌های متداول</p>
            <h2 className="section-title">پیش از مراجعه، آگاه‌تر باشید</h2>
            <Link prefetch={false} className="text-link" href="/patient-guide/">راهنمای بیماران ←</Link>
            <div className="education-reading">
              {publishedArticles.slice(0, 2).map(({metadata}) => <ArticleCard key={metadata.slug} article={metadata}/>)}
              <Link prefetch={false} className="text-link" href="/blog/">همهٔ مقالات و پژوهش‌ها ←</Link>
            </div>
          </div>
          <div id="home-faq">
            <FAQ/>
            <Link prefetch={false} className="text-link" href="/patient-guide/#after-treatment">راهنمای قبل و بعد از درمان ←</Link>
          </div>
        </div>
      </section>
      <ContactInformation/>
    </FullPageScroll>
  );
}
