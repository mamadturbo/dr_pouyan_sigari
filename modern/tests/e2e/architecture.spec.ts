import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes=['/','/about/','/expertise/','/publications/','/contact/','/gallery/','/patient-guide/','/blog/','/privacy/','/terms/','/expertise/oral-maxillofacial/','/expertise/dental-implants/','/expertise/orthognathic/','/blog/finding-research/'];
test('public pages remain readable across phone, tablet, landscape and desktop',async({page},info)=>{
  test.setTimeout(120000);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[360,640],[390,844],[768,1024],[1024,768],[740,360],[1440,900]]){
    await page.setViewportSize({width,height});
    for(const route of routes){
      expect((await page.goto(route))?.status(),route).toBe(200);
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' at '+width).toBe(true);
      await expect(page.locator('.header-inner>a[href="/contact/"]')).toBeVisible();
      if(route==='/'||route==='/gallery/'||route==='/expertise/dental-implants/'||route==='/patient-guide/')await page.screenshot({path:info.outputPath(route.replaceAll('/','-')+'-'+width+'.png'),fullPage:true});
    }
  }
  expect(errors).toEqual([]);
});
test('new page types pass automated accessibility checks',async({page})=>{
  test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of routes){
    await page.goto(route);
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations,route+' '+JSON.stringify(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))).toEqual([]);
  }
});
test('visitors can travel from cases to services, care, articles and clinic contact',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.locator('.hero-reference-actions').getByRole('link',{name:'مشاهده نمونه‌کارها',exact:true}).click();
  await expect(page).toHaveURL(/\/gallery\/$/);
  await page.locator('main .page-actions').getByRole('link',{name:/آشنایی با خدمات/}).click();
  await page.locator('.service-card').nth(1).getByRole('link').click();
  await expect(page).toHaveURL(/\/expertise\/dental-implants\/$/);
  await page.getByRole('link',{name:'راهنمای پیگیری ←',exact:true}).click();
  await expect(page).toHaveURL(/\/patient-guide\/#after-treatment$/);
  await expect(page.locator('#after-treatment')).toBeInViewport();
  await page.getByRole('link',{name:'مقالات و مطالعهٔ بیشتر ←',exact:true}).click();
  await page.locator('.article-card').getByRole('link',{name:'مطالعهٔ مقاله ←',exact:true}).click();
  await expect(page).toHaveURL(/\/blog\/finding-research\/$/);
  await page.locator('.prose').getByRole('link',{name:'تماس با مطب ←',exact:true}).click();
  await expect(page).toHaveURL(/\/contact\/$/);await expect(page.locator('.contact-phone')).toHaveAttribute('href','tel:+984533235000');
});
