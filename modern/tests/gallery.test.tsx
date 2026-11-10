import {beforeAll,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {CaseGallery} from '@/components/gallery/CaseGallery';
import {publicCases} from '@/lib/cases';
const image={src:'/assets/cases/test-before.webp',alt:'تصویر آزمون قبل',width:600,height:800};
const items=publicCases([
  {id:'implant-test',title:'آزمون ایمپلنت',category:'ایمپلنت',before:image,after:{...image,alt:'تصویر آزمون بعد'},relatedService:'dental-implants',publicationApproved:true,description:'توضیح آزمایشی'},
  {id:'jaw-test',title:'آزمون فک',category:'فک',before:image,after:image,relatedService:'orthognathic',publicationApproved:true},
]);
beforeAll(()=>{
  HTMLDialogElement.prototype.showModal=vi.fn(function(this:HTMLDialogElement){this.setAttribute('open','');});
  HTMLDialogElement.prototype.close=vi.fn(function(this:HTMLDialogElement){this.removeAttribute('open');});
});
describe('gallery interactions',()=>{
  it('shows an honest empty state with a working contact destination',()=>{
    render(<CaseGallery items={[]} filterable/>);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByRole('link',{name:/ارتباط با مطب/}).getAttribute('href')).toMatch(/^\/contact\/?$/);
  });
  it('filters real records and links to the related treatment',()=>{
    render(<CaseGallery items={items} filterable/>);
    fireEvent.change(screen.getByLabelText('نوع جراحی'),{target:{value:'فک'}});
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('۱');
    expect(screen.getByRole('link',{name:/جراحی اصلاح/}).getAttribute('href')).toMatch(/^\/expertise\/orthognathic\/?$/);
  });
  it('opens both images and restores trigger focus and body scrolling on Escape',()=>{
    render(<CaseGallery items={items}/>);
    const button=screen.getByRole('button',{name:'بزرگ‌نمایی آزمون ایمپلنت'});button.focus();fireEvent.click(button);
    const modal=screen.getByRole('dialog');expect(modal).toBeVisible();expect(document.body.style.overflow).toBe('hidden');
    expect(modal.querySelectorAll('img')).toHaveLength(2);
    fireEvent(modal,new Event('cancel',{bubbles:false}));
    expect(screen.queryByRole('dialog')).toBeNull();expect(button).toHaveFocus();expect(document.body.style.overflow).toBe('');
  });
});
