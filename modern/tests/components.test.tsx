import {describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {SiteHeader} from '@/components/layout/SiteHeader';
import {PublicationCard} from '@/components/publications/PublicationCard';
import {PublicationFilters} from '@/components/publications/PublicationFilters';
import {ArticleCard} from '@/components/blog/ArticleCard';
import {publications} from '@/content/data/publications';
import type {ArticleMetadata} from '@/types/content';
vi.mock('next/navigation',()=>({usePathname:()=>'/blog/'}));
const article:ArticleMetadata={status:'published',title:'راهنمای مراجعه به مطب',description:'اطلاعات ضروری برای هماهنگی نخستین مراجعه',slug:'first-visit',author:'تحریریهٔ وب‌سایت',authorRole:'راهنما',publishedAt:'2026-10-19',category:'مراجعه',tags:[],featured:true,toc:[],references:[]};
describe('navigation and content components',()=>{
  it('opens mobile menu, reflects state, closes on Escape and restores focus',()=>{
    render(<SiteHeader/>);const button=screen.getByRole('button',{name:'باز کردن منو'});fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded','true');expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window,{key:'Escape'});expect(button).toHaveAttribute('aria-expanded','false');expect(button).toHaveFocus();expect(document.body.style.overflow).toBe('');
  });
  it('marks the current route and releases body state on unmount',()=>{const {unmount}=render(<SiteHeader/>);expect(screen.getByRole('link',{name:'مقالات'})).toHaveAttribute('aria-current','page');fireEvent.click(screen.getByRole('button',{name:'باز کردن منو'}));unmount();expect(document.body.style.overflow).toBe('');});
  it('renders the verified research link and isolated English title',()=>{render(<PublicationCard item={publications[0]}/>);expect(screen.getByRole('link',{name:/مشاهدهٔ مقاله/})).toHaveAttribute('href',publications[0].publicationUrl);expect(screen.getByText(publications[0].englishTitle)).toHaveAttribute('dir','ltr');});
  it('renders author, date, featured flag and static article URL',()=>{render(<ArticleCard article={article}/>);expect(screen.getByRole('heading',{name:article.title})).toBeVisible();expect(screen.getByText(/تحریریه/)).toBeVisible();expect(document.querySelector('time')).toHaveAttribute('datetime','2026-10-19');expect(screen.getByRole('link',{name:/مطالعه/}).getAttribute('href')).toMatch(/^\/blog\/first-visit\/?$/);});
  it('announces empty results and restores the archive after clearing search',()=>{render(<PublicationFilters items={publications}/>);fireEvent.change(screen.getByRole('searchbox'),{target:{value:'no-match'}});expect(screen.getByText(/پژوهشی با این مشخصات/)).toBeVisible();fireEvent.change(screen.getByRole('searchbox'),{target:{value:''}});expect(screen.getAllByRole('article')).toHaveLength(3);});
});
