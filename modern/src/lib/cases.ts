import {z} from 'zod';
import {getService} from '@/content/data/services';
const image=z.object({src:z.string().regex(/^\/assets\/cases\/[a-zA-Z0-9/_-]+\.(?:webp|jpg|jpeg|png|avif)$/),alt:z.string().min(1),width:z.number().int().positive(),height:z.number().int().positive()});
// No patient name, age, contact, clinical record or consent document is serialized.
export const caseSchema=z.object({
  id:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),title:z.string().min(1),category:z.string().min(1),
  before:image,after:image,angle:z.string().optional(),interval:z.string().optional(),
  description:z.string().optional(),relatedService:z.string().refine(slug=>Boolean(getService(slug))),
  publicationApproved:z.boolean().default(false),order:z.number().int().default(0),featured:z.boolean().default(false),
});
export type SurgicalCase=z.infer<typeof caseSchema>;
export type PublicCase=Omit<SurgicalCase,'publicationApproved'>;
export function publicCases(records:unknown[]):PublicCase[]{
  const parsed=caseSchema.array().parse(records);
  if(new Set(parsed.map(record=>record.id)).size!==parsed.length)throw new Error('Duplicate surgical case ID');
  return parsed.filter(record=>record.publicationApproved).sort((a,b)=>a.order-b.order).map(({publicationApproved,...record})=>record);
}
