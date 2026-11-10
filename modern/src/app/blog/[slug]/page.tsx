import Link from 'next/link';
import {notFound} from 'next/navigation';
import {PageIntro} from '@/components/layout/PageIntro';
import {ArticleCard} from '@/components/blog/ArticleCard';
import {publishedArticles,getArticle,persianDate} from '@/lib/content';
import {pageMetadata} from '@/lib/seo';
export const dynamicParams=false;
export function generateStaticParams(){return publishedArticles.map(({metadata})=>({slug:metadata.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const item=getArticle(slug);return item?pageMetadata(item.metadata.title,item.metadata.description,'/blog/'+slug+'/'):{};}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const item=getArticle(slug);if(!item)notFound();const {metadata:article,Component}=item;
  const related = publishedArticles.filter(({metadata}) => metadata.slug !== slug && (
    metadata.category === article.category || metadata.tags.some(tag => article.tags.includes(tag))
  )).slice(0, 3);
  return <main id="main" tabIndex={-1} className="interior"><PageIntro title={article.title} description={article.description} path={'/blog/'+slug+'/'}/><article className="container article-layout"><div className="article-meta"><p>{article.author} • {article.authorRole}</p><p>تاریخ انتشار: <time dateTime={article.publishedAt}>{persianDate(article.publishedAt)}</time></p>{article.updatedAt&&<p>آخرین ویرایش: <time dateTime={article.updatedAt}>{persianDate(article.updatedAt)}</time></p>}{article.reviewedBy&&<p>بازبینی پزشکی: {article.reviewedBy} • {persianDate(article.reviewedAt!)}</p>}</div><div className="article-columns"><aside><nav className="article-toc" aria-label="فهرست مقاله"><h2>در این نوشته</h2><ul>{article.toc.map(heading=><li key={heading.id}><a href={'#'+heading.id}>{heading.title}</a></li>)}</ul></nav></aside><div className="prose"><Component/>{article.references.length>0&&<section><h2>منابع</h2><ul>{article.references.map(reference=><li key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title} ↗</a></li>)}</ul></section>}<div className="page-actions"><Link prefetch={false} className="text-link" href="/patient-guide/">راهنمای بیماران ←</Link><Link prefetch={false} className="text-link" href="/publications/">پژوهش‌های پزشک ←</Link><Link prefetch={false} className="text-link" href="/contact/">تماس با مطب ←</Link></div></div></div></article>{related.length>0&&<section className="container section-space"><h2>مطالعهٔ مرتبط</h2><div className="article-grid">{related.map(other=><ArticleCard key={other.metadata.slug} article={other.metadata}/>)}</div></section>}</main>;
}
