import type { MetadataRoute } from 'next';
import {services} from '@/content/data/services';
import {publishedArticles} from '@/lib/content';
import {absolute,siteUrl} from '@/lib/seo';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{
  if(!siteUrl) return [];
  return ['/','/about/','/expertise/','/publications/','/contact/','/gallery/','/patient-guide/','/blog/','/privacy/','/terms/',...services.map(service=>'/expertise/'+service.slug+'/'),...publishedArticles.map(item=>'/blog/'+item.metadata.slug+'/')].map(path=>({url:absolute(path)!}));
}
