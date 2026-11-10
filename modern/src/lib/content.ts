import Consultation, { article as consultation } from '@/content/blog/first-consultation.mdx';
import Research, { article as research } from '@/content/blog/finding-research.mdx';
import { articleSchema, publicationSchema, doctorSchema, experienceSchema, expertiseSchema, faqSchema } from './schemas';
import { publications } from '@/content/data/publications';
import { doctor } from '@/content/data/doctor';
import { experience } from '@/content/data/experience';
import { expertise } from '@/content/data/expertise';
import { faq } from '@/content/data/faq';
doctorSchema.parse(doctor); experienceSchema.array().parse(experience); expertiseSchema.array().parse(expertise); faqSchema.array().parse(faq);
export const articles = [
  {metadata:articleSchema.parse(consultation), Component:Consultation},
  {metadata:articleSchema.parse(research), Component:Research}
].sort((a,b)=>b.metadata.publishedAt.localeCompare(a.metadata.publishedAt));
if(new Set(articles.map(a=>a.metadata.slug)).size !== articles.length) throw new Error('Duplicate article slug');
export const verifiedPublications = publicationSchema.array().parse(publications);
if(new Set(verifiedPublications.map(p=>p.id)).size !== verifiedPublications.length) throw new Error('Duplicate publication ID');
export const publishedArticles=articles.filter(article=>article.metadata.status==='published');
export function getArticle(slug:string){return publishedArticles.find(a=>a.metadata.slug===slug);}
export function persianDate(date:string){return new Intl.DateTimeFormat('fa-IR',{dateStyle:'long',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));}
