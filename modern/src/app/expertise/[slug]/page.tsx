import Link from 'next/link';
import {notFound} from 'next/navigation';
import {PageIntro} from '@/components/layout/PageIntro';
import {CaseGallery} from '@/components/gallery/CaseGallery';
import {ContactInformation} from '@/components/doctor/ContactInformation';
import {services,getService} from '@/content/data/services';
import {approvedCases} from '@/content/data/cases';
import {pageMetadata} from '@/lib/seo';
export const dynamicParams=false;
export function generateStaticParams(){return services.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const service=getService(slug);return service?pageMetadata(service.title,service.description,'/expertise/'+slug+'/'):{};}
export default async function ServicePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const service=getService(slug);if(!service)notFound();
  return <main id="main" tabIndex={-1} className="interior"><PageIntro title={service.title} description={service.description} path={'/expertise/'+slug+'/'} parent={{href:'/expertise/',title:'خدمات'}}/>
    <div className="container service-detail"><section><h2>کاربردها و هدف ارزیابی</h2><p>{service.evidence}</p><a className="text-link" href={service.source} target="_blank" rel="noopener noreferrer">مشاهدهٔ منبع سابقه ↗</a><p>برای اطلاع از امکان بررسی مشکل خود در این حوزه، با مطب هماهنگ کنید. انتخاب روش مناسب به ارزیابی فردی نیاز دارد.</p></section>
    <section><h2>روند ارزیابی و درمان</h2><ol><li>تماس با مطب و هماهنگی اولیه</li><li>مشاوره و بررسی شرایط و مدارک مرتبط</li><li>گفت‌وگو دربارهٔ روش مناسب و برنامهٔ درمان</li><li>هماهنگی پیگیری طبق برنامهٔ ارائه‌شده</li></ol><Link prefetch={false} className="text-link" href="/patient-guide/">آمادگی برای مراجعه ←</Link></section>
    <section><h2>نمونه‌جراحی‌های مرتبط</h2><CaseGallery items={approvedCases.filter(item=>item.relatedService===slug)}/><Link prefetch={false} className="text-link" href="/gallery/">گالری کامل ←</Link></section>
    <section><h2>محدودیت‌ها و ملاحظات</h2><p>این معرفی جایگزین معاینه نیست. دربارهٔ مناسب‌بودن روش، محدودیت‌ها و نتیجهٔ مورد انتظار در جلسهٔ مشاوره سؤال کنید. سابقهٔ علمی به‌تنهایی به معنای ارائهٔ فعلی یک خدمت نیست.</p></section>
    <section id="care"><h2>مراقبت‌ها و دورهٔ بهبودی</h2><p>دستورهای اختصاصی این درمان و مدت بهبودی هنوز برای انتشار در سایت تأیید نشده‌اند. برنامهٔ مراقبت و پیگیری را از پزشک معالج دریافت کنید.</p><Link prefetch={false} className="text-link" href="/patient-guide/#after-treatment">راهنمای پیگیری ←</Link></section>
    <section><h2>سؤالات متداول</h2><details className="faq-item"><summary>امکان انجام این درمان را چگونه بررسی کنم؟</summary><div className="faq-answer">برای هماهنگی ارزیابی و اطلاع از خدمات فعلی، با مطب تماس بگیرید.</div></details><details className="faq-item"><summary>هزینه و زمان درمان چگونه مشخص می‌شود؟</summary><div className="faq-answer">اطلاعات تأییدشده‌ای دربارهٔ هزینه و زمان این درمان در سایت منتشر نشده است؛ هنگام هماهنگی و مشاوره از مطب بپرسید.</div></details></section></div><ContactInformation/>
  </main>;
}
