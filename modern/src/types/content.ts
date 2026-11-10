import type { z } from 'zod';
import type { articleSchema, publicationSchema } from '@/lib/schemas';
export type Doctor = { name: string; english: string; specialty: string; city: string; license: string; telephone: string; displayPhone: string; address: string; profileUrl: string; mapSearch: string };
export type Education = { qualification: string; institution: string; year: string; sourceUrl: string };
export type Experience = { year: string; title: string; text: string; url: string; extraUrl?: string };
export type Expertise = { icon: string; title: string; text: string };
export type FAQ = { question: string; answer: string };
export type Publication = z.infer<typeof publicationSchema>;
export type ArticleMetadata = z.infer<typeof articleSchema>;
