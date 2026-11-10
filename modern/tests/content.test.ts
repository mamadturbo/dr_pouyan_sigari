import {describe,it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {articleSchema,publicationSchema,slugify,httpsUrl} from '@/lib/schemas';
import {filterPublications} from '@/lib/publications';
import {publications} from '@/content/data/publications';
import {doctor} from '@/content/data/doctor';
import {experience} from '@/content/data/experience';
import {expertise} from '@/content/data/expertise';
import {faq} from '@/content/data/faq';
import {personSchema} from '@/lib/seo';
const evidence=JSON.parse(readFileSync('../research/publications.json','utf8')).filter((p:{attribution_status:string})=>p.attribution_status==='تأییدشده');
it('matches verified publisher metadata and withholds unreviewed summaries and candidates',()=>{
  expect(publications).toHaveLength(evidence.length);
  publications.forEach((p,index)=>{const source=evidence[index];expect(p).toMatchObject({englishTitle:source.title,authors:source.authors,journal:source.journal,year:Number(source.publication_date.slice(0,4)),volume:source.volume,issue:source.issue,pages:source.pages,publicationUrl:source.publisher_url});expect(p.doi).toBe(source.doi??undefined);expect(p.abstract).toBeUndefined();expect(p.publicationDate).toBe(source.date_precision==='day'?source.publication_date:undefined);expect(p.description).not.toBe(source.abstract_summary_fa);});
});
it('separates the webinar from congress responsibility and excludes unverified accounts',()=>{
  expect(experience.find(e=>e.title==='وبینار جراحی فک و صورت')?.url).toBe('https://t.me/IranianGDA/11904');
  expect(experience.find(e=>e.title==='مسئولیت علمی کنگرهٔ شانزدهم')?.url).toBe('https://t.me/IranianGDA/12066');
  expect(personSchema.sameAs).toEqual([doctor.profileUrl]);
  expect(JSON.stringify({doctor,expertise,faq,personSchema})).not.toMatch(/instagram|Clubhouse|زیبایی بینی|پلک|دررفتگی|aggregateRating|openingHours/);
});
describe('publication archive',()=>{
  it('validates records and rejects mismatched publication years',()=>{expect(publicationSchema.array().parse(publications)).toHaveLength(3);expect(publicationSchema.safeParse({...publications[1],publicationDate:'2026-01-01'}).success).toBe(false);});
  it('sorts both ways without mutating content',()=>{const original=publications.map(p=>p.year);expect(filterPublications(publications).map(p=>p.year)).toEqual([2026,2019,2016]);expect(filterPublications(publications,'','','oldest').map(p=>p.year)).toEqual([2016,2019,2026]);expect(publications.map(p=>p.year)).toEqual(original);});
  it('combines category and normalized bilingual search',()=>{expect(filterPublications(publications,'ایمپلنت دندانی',' INTRA-lock ')).toHaveLength(1);expect(filterPublications(publications,'دندان نهفته','2016')).toHaveLength(0);expect(filterPublications(publications,'','ناموجود')).toEqual([]);});
  it('rejects unsafe source URLs and malformed identifiers',()=>{expect(httpsUrl.safeParse('javascript:alert(1)').success).toBe(false);expect(publicationSchema.safeParse({...publications[0],doi:'made-up'}).success).toBe(false);});
});
describe('trusted MDX metadata',()=>{
  const metadata=readdirSync('src/content/blog').map(file=>JSON.parse(readFileSync('src/content/blog/'+file,'utf8').match(/^export const article = (\{[\s\S]*?\n\});/)![1]));
  it('parses the metadata contract and unique slugs',()=>{metadata.forEach(m=>expect(articleSchema.safeParse(m).success).toBe(true));expect(new Set(metadata.map(m=>m.slug)).size).toBe(metadata.length);});
  it('rejects invalid dates, order, slugs and unpaired review attribution',()=>{const base=metadata[0];for(const patch of [{publishedAt:'2026-02-30'},{updatedAt:'2020-01-01'},{slug:'../bad'},{reviewedBy:'Someone'}])expect(articleSchema.safeParse({...base,...patch}).success).toBe(false);});
  it('generates deterministic slugs for Persian and English',()=>{expect(slugify('  Finding Research! ')).toBe('finding-research');expect(slugify('راهنمای مراجعه')).toBe('راهنمای-مراجعه');});
});
