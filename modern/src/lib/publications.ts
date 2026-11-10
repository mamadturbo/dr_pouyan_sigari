import type { Publication } from '@/types/content';

function normalizeSearch(text: string) {
  return text.normalize('NFKC')
    .replace(/[۰-۹٠-٩]/g, digit => String(digit.charCodeAt(0) & 15))
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u0640\u064B-\u065F\u0670]/g, '')
    .replace(/[\s\u200C]+/g, ' ')
    .trim()
    .toLowerCase();
}

export function filterPublications(items: Publication[], category = '', query = '', order: 'newest' | 'oldest' = 'newest') {
  const terms = normalizeSearch(query).split(' ').filter(Boolean);
  return items.filter(item => {
    if (category && item.category !== category) return false;
    if (!terms.length) return true;
    const index = normalizeSearch([item.title,item.englishTitle,item.description,item.category,item.journal,...item.authors,item.year].join(' '));
    return terms.every(term => index.includes(term));
  })
    .sort((a,b) => (order === 'newest' ? b.year-a.year : a.year-b.year) || a.id.localeCompare(b.id));
}
