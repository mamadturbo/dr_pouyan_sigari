import { z } from 'zod';
export const httpsUrl = z.url().refine(value => new URL(value).protocol === 'https:', 'HTTPS URL required');
export const doctorSchema = z.object({name:z.string().min(1),english:z.string().min(1),specialty:z.string().min(1),city:z.string().min(1),license:z.string().min(1),telephone:z.string().regex(/^\+[1-9]\d{7,14}$/),displayPhone:z.string().min(1),address:z.string().min(10),profileUrl:httpsUrl,mapSearch:httpsUrl});
export const experienceSchema = z.object({year:z.string().min(1),title:z.string().min(1),text:z.string().min(1),url:httpsUrl,extraUrl:httpsUrl.optional()});
export const expertiseSchema = z.object({icon:z.string().min(1),title:z.string().min(1),text:z.string().min(1)});
export const faqSchema = z.object({question:z.string().min(1),answer:z.string().min(1)});
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value); return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
}, 'Invalid calendar date');
export const publicationSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), englishTitle: z.string().min(1),
  description: z.string().min(1), authors: z.array(z.string().min(1)),
  journal: z.string().min(1).nullable(), year: z.number().int().min(1900).max(2100),
  publicationDate: date.optional(), volume: z.string().min(1), issue: z.string().min(1), pages: z.string().min(1),
  doi: z.string().regex(/^10\.\d{4,9}\/\S+$/).optional(),
  pubmedUrl: httpsUrl.optional(), publicationUrl: httpsUrl,
  abstract: z.string().optional(), category: z.string(), featured: z.boolean(), icon: z.string()
}).refine(data => !data.publicationDate || Number(data.publicationDate.slice(0,4)) === data.year, 'Publication date and year differ');
export const articleSchema = z.object({
  status: z.enum(['draft','published']).default('draft'),
  title: z.string().min(5), description: z.string().min(20),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  author: z.string().min(1), authorRole: z.string().min(1),
  publishedAt: date, updatedAt: date.optional(), reviewedBy: z.string().optional(), reviewedAt: date.optional(),
  category: z.string().min(1), tags: z.array(z.string()), featured: z.boolean(),
  coverImage: z.string().regex(/^\/assets\/[a-zA-Z0-9-]+\.webp$/).optional(),
  toc: z.array(z.object({id: z.string().regex(/^[a-z0-9-]+$/), title: z.string()})),
  references: z.array(z.object({title: z.string(), url: httpsUrl}))
}).refine(data => !data.updatedAt || data.updatedAt >= data.publishedAt, 'Updated date precedes publication')
  .refine(data => Boolean(data.reviewedBy) === Boolean(data.reviewedAt), 'Reviewer and review date must be paired');
export function slugify(value: string) {
  return value.normalize('NFKC').toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
}
