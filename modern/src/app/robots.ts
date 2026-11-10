import type {MetadataRoute} from 'next';
import {siteUrl,absolute} from '@/lib/seo';
export const dynamic='force-static';
export default function robots():MetadataRoute.Robots{return {rules:siteUrl?{userAgent:'*',allow:'/'}:{userAgent:'*',disallow:'/'},sitemap:absolute('/sitemap.xml')};}
