// Only topics documented in the current expertise data. Availability is not inferred.
export const services = [
  {slug:'oral-maxillofacial',title:'جراحی دهان، فک و صورت',icon:'tooth',category:'جراحی دهان، فک و صورت',
    description:'آشنایی با حوزهٔ تخصص ثبت‌شدهٔ پزشک و مسیر ارزیابی و هماهنگی مراجعه.',
    evidence:'تخصص و بورد (دانشنامه) جراحی دهان، فک و صورت در پروفایل نظام پزشکی ثبت شده است.',
    source:'https://membersearch.irimc.org/member/profile?id=32b39ef4-eeb5-4f3e-9849-ef582561c563'},
  {slug:'dental-implants',title:'ایمپلنت دندانی',icon:'implant',category:'ایمپلنت دندانی',
    description:'آشنایی با سابقهٔ مستند مرتبط با ایمپلنت و هماهنگی ارزیابی با مطب.',
    evidence:'مقالهٔ سال ۲۰۱۹، سابقهٔ درمان ایمپلنت در مطب دکتر سیگاری در اردبیل را توصیف می‌کند.',
    source:'https://ajdr.umsha.ac.ir/Article/ajdr-306'},
  {slug:'orthognathic',title:'جراحی اصلاح ناهنجاری فک',icon:'profile',category:'جراحی اصلاح ناهنجاری فک',
    description:'آشنایی با سابقهٔ آموزشی جراحی ارتوگناتیک و مسیر گفت‌وگو دربارهٔ ارزیابی تخصصی.',
    evidence:'نام دکتر سیگاری برای سخنرانی دربارهٔ اصول جراحی ارتوگناتیک در برنامه‌های آموزشی ۱۴۰۳ و ۱۴۰۵ معرفی شده است.',
    source:'https://t.me/IranianGDA/11904'},
] as const;
export function getService(slug:string){return services.find(service=>service.slug===slug);}
