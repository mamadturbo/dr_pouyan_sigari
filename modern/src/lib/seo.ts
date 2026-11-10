import type { Metadata } from 'next';
import { doctor } from '@/content/data/doctor';
// An origin is not inferred from a broken legacy hosting registration.
const configured = process.env.SITE_URL;
export const siteUrl = configured ? new URL(configured).origin : undefined;
export function absolute(path: string) { return siteUrl ? new URL(path, siteUrl).toString() : undefined; }
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = absolute(path);
  return {
    title, description, alternates: url ? {canonical: url} : undefined,
    openGraph: {title,description,locale:'fa_IR',type:'website',url,siteName:doctor.name,
      images: siteUrl ? [{url:absolute('/assets/doctor-hero.webp')!,width:1400,height:933,alt:doctor.name}] : []},
    twitter: {card:'summary_large_image',title,description,images:siteUrl ? [absolute('/assets/doctor-hero.webp')!] : []},
    robots: siteUrl ? {index:true,follow:true} : {index:false,follow:false}
  };
}
export const personSchema = {
  '@context':'https://schema.org', '@type':'Person', '@id':absolute('/#doctor'),
  name:doctor.name, alternateName:doctor.english, jobTitle:doctor.specialty,
  telephone:doctor.telephone, identifier:{'@type':'PropertyValue',propertyID:'شمارهٔ نظام پزشکی',value:doctor.license},
  address:{'@type':'PostalAddress',streetAddress:doctor.address,addressLocality:doctor.city,addressCountry:'IR'},
  sameAs:[doctor.profileUrl],url:absolute('/')
};
