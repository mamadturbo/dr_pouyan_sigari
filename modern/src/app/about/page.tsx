import Link from 'next/link';
import {PageIntro} from '@/components/layout/PageIntro';
import {EducationTimeline} from '@/components/doctor/EducationTimeline';
import {doctor} from '@/content/data/doctor';
import {education} from '@/content/data/education';
import {pageMetadata,personSchema} from '@/lib/seo';
import {JsonLd} from '@/components/ui/JsonLd';
import {Icon} from '@/components/ui/Icon';
export const metadata=pageMetadata('دربارهٔ پزشک','معرفی مدارک ثبت‌شده و سوابق تاریخ‌دار آموزش و پژوهش دکتر پویان سیگاری، متخصص جراحی دهان، فک و صورت.','/about/');
export default function About(){return <main id="main" tabIndex={-1} className="interior about-page"><div className="container profile-spread">
  <PageIntro title="پشت هر تصمیم، دانش و تجربه." description="مسیر علمی، آموزش و تجربهٔ دکتر پویان سیگاری" label="دربارهٔ پزشک" path="/about/">
    <ul className="profile-highlights">
      <li><span className="paper-icon"><Icon name="profile"/></span><span><strong>مدارک ثبت‌شده</strong><small>تخصص و بورد جراحی دهان، فک و صورت</small></span></li>
      <li><span className="paper-icon"><Icon name="book"/></span><span><strong>فعالیت علمی و آموزشی</strong><small>تدریس دوره‌های تخصصی و فعالیت پژوهشی</small></span></li>
    </ul>
    <Link prefetch={false} className="button" href="#experience">مشاهدهٔ سوابق علمی</Link>
    <Link prefetch={false} className="outline-action" href="/publications/">پژوهش‌ها و مقالات ←</Link>
  </PageIntro>
  <figure className="profile-portrait"><img src="/assets/story-start.webp" alt="تصویر نمایشی دکتر سیگاری با لباس رسمی" width="522" height="784"/></figure>
</div><JsonLd data={personSchema}/><section className="container biography"><div><h2>{doctor.name}</h2><p>{doctor.specialty} در {doctor.city}، شمارهٔ نظام پزشکی {doctor.license}.</p><p>مدارک ثبت‌شده در نظام پزشکی شامل دکترای حرفه‌ای دندانپزشکی و تخصص جراحی دهان، فک و صورت است. مدرک مرتبط با پروانه، بورد (دانشنامه) این تخصص ثبت شده است. <a className="text-link" href={doctor.profileUrl}>پروفایل نظام پزشکی</a></p><p>در منابع ۲۰۱۶ و ۱۳۹۶، ایشان به‌عنوان استادیار بخش جراحی دهان، فک و صورت دانشگاه علوم پزشکی اردبیل معرفی شده‌اند. این عنوان، سابقهٔ تاریخی ثبت‌شده در منابع است.</p><p>تدریس دوره‌های تخصصی، معرفی در مسئولیت‌های علمی کنگره‌های دندانپزشکی و پژوهش در حوزه‌های آسیب‌های صورت، ایمپلنت و دندان نهفته بخشی از سوابق موجود ایشان است.</p><p>در مقالهٔ سال ۲۰۲۶، وابستگی نویسنده به گروه جراحی دهان، فک و صورت دانشگاه علوم پزشکی اردبیل ذکر شده است. <a className="text-link" href="https://jurnal.unimus.ac.id/index.php/IJD/article/view/19835">مشاهدهٔ منبع</a></p></div></section>{education.length>0&&<section className="container section-space"><h2>تحصیلات و گواهی‌ها</h2>{education.map(e=><p key={e.qualification}>{e.qualification}، {e.institution}، {e.year}</p>)}</section>}<section id="experience" className="container section-space editorial-spread academic-spread"><div><p className="eyebrow">آموزش و فعالیت علمی</p><h2 className="section-title">مسیر علمی به روایت منابع</h2><p className="section-description">تاریخ‌ها و منابع هر فعالیت در کنار آن آمده‌اند. معرفی سخنران یا درج نام در برنامه، به‌تنهایی گزارش حضور در رویداد نیست.</p></div><EducationTimeline/></section><div className="container page-actions"><Link prefetch={false} className="text-link" href="/publications/">پژوهش‌های علمی ←</Link><Link prefetch={false} className="text-link" href="/gallery/">نمونه‌کارها ←</Link><Link prefetch={false} className="button" href="/contact/">تماس با مطب</Link></div></main>;}
