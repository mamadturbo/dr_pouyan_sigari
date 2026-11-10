import Link from 'next/link';
import {PageIntro} from '@/components/layout/PageIntro';
import {ArticleFilters} from '@/components/blog/ArticleFilters';
import {PublicationCard} from '@/components/publications/PublicationCard';
import {publishedArticles,verifiedPublications} from '@/lib/content';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('مقالات','نوشته‌های تحریریه و دسترسی به پژوهش‌های علمی دکتر پویان سیگاری؛ همراه با منابع و مشخصات انتشار موجود.','/blog/');
export default function Blog(){return <main id="main" tabIndex={-1} className="interior"><PageIntro title="مقالات" description="برای مطالعهٔ آگاهانه؛ نوشته‌های تحریریه و پژوهش‌های علمی" path="/blog/"/><section className="container archive"><h2>نوشته‌های تحریریه</h2><ArticleFilters items={publishedArticles.map(item=>item.metadata)}/></section><section className="container section-space"><div className="section-heading"><h2 className="section-title">پژوهش‌های علمی پزشک</h2><Link prefetch={false} className="text-link" href="/publications/">آرشیو و جست‌وجوی پژوهش‌ها ←</Link></div><div className="research-grid">{verifiedPublications.map(item=><PublicationCard key={item.id} item={item}/>)}</div></section><div className="container page-actions"><Link prefetch={false} className="text-link" href="/patient-guide/">راهنمای بیماران ←</Link><Link prefetch={false} className="button" href="/contact/">تماس با مطب</Link></div></main>;}
