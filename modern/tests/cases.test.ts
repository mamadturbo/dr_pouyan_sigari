import {describe,it,expect} from 'vitest';
import {caseSchema,publicCases} from '@/lib/cases';
const image={src:'/assets/cases/test-before.webp',alt:'تصویر آزمون',width:600,height:800};
const record={id:'test-case',title:'کیس آزمایشی',category:'ایمپلنت دندانی',before:image,after:{...image,src:'/assets/cases/test-after.webp'},relatedService:'dental-implants'};
describe('case publication boundary',()=>{
  it('requires explicit approval and both original image references',()=>{
    expect(publicCases([record])).toEqual([]);
    expect(caseSchema.safeParse({...record,publicationApproved:true,after:undefined}).success).toBe(false);
  });
  it('removes identifiers and approval state before serialization and orders approved cases',()=>{
    const result=publicCases([{...record,id:'later',publicationApproved:true,order:10,patientName:'PRIVATE',phone:'PRIVATE'}, {...record,publicationApproved:true,order:1}, {...record,id:'draft',publicationApproved:false}]);
    expect(result.map(item=>item.id)).toEqual(['test-case','later']);
    expect(JSON.stringify(result)).not.toMatch(/PRIVATE|patientName|phone|publicationApproved|draft/);
  });
  it('rejects unsafe media, broken service relations and duplicate identifiers',()=>{
    for(const src of ['https://example.com/patient.jpg','/assets/cases/../private.jpg','javascript:alert(1)'])expect(caseSchema.safeParse({...record,before:{...image,src}}).success).toBe(false);
    expect(caseSchema.safeParse({...record,relatedService:'unknown'}).success).toBe(false);
    expect(()=>publicCases([record,record])).toThrow('Duplicate');
  });
});
