import {test,expect,type Page} from '@playwright/test';
async function naturalHome(page:Page){
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode',/natural|fullpage/);
}
async function goStory(page:Page){
  if(await page.locator('main').getAttribute('data-scroll-mode')==='fullpage'){
    await page.getByRole('button',{name:'بخش 5: آشنایی با پزشک',exact:true}).click();
    await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section','4');
    await expect(page.locator('#page-shell')).toHaveAttribute('data-transitioning','false');
  }else await page.locator('#about').scrollIntoViewIfNeeded();
}
import AxeBuilder from '@axe-core/playwright';
test('all exported routes, semantic content, console and overflow',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
  for(const route of ['/','/about/','/expertise/','/publications/','/contact/']){
    expect((await page.goto(route))?.status()).toBe(200);await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});
test('navigation, mobile menu and keyboard focus',async({page,isMobile})=>{
  await page.goto('/');
  if(isMobile){const toggle=page.locator('.menu-toggle');await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await toggle.click();await page.getByRole('navigation',{name:'منوی موبایل'}).getByRole('link',{name:'مقالات',exact:true}).click();await expect(toggle).toHaveAttribute('aria-expanded','false');}
  else await page.getByRole('navigation',{name:'منوی اصلی'}).getByRole('link',{name:'مقالات',exact:true}).click();
  await expect(page).toHaveURL(/blog/);await expect(page.locator('h1')).toContainText('مقالات');
});
test('publication category, year sort, search and empty state',async({page})=>{
  await page.goto('/publications/');await expect(page.getByRole('article')).toHaveCount(3);
  await expect(page.getByRole('article').first()).toContainText('نیش نهفته');
  await page.getByLabel('ترتیب نمایش').selectOption('oldest');await expect(page.getByRole('article').first()).toContainText('شکستگی');
  await page.getByLabel('حوزهٔ پژوهش').selectOption('ایمپلنت دندانی');await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('searchbox').fill('not-a-paper');await expect(page.getByText(/پژوهشی با این مشخصات/)).toBeVisible();
});
test('doctor story forward/reverse, reset and route cleanup',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await naturalHome(page);const story=page.locator('.story-card');await goStory(page);
  await expect(story).toHaveAttribute('data-playback',/idle|armed/);
  await page.keyboard.press('ArrowDown');
  await expect(story).toHaveAttribute('data-playback','complete');await expect(story).toHaveAttribute('data-result','ended');
  await expect(page.locator('.story-surgical')).toBeVisible();await expect(page.locator('html')).not.toHaveClass(/story-scroll-locked/);
  await page.keyboard.press('ArrowUp');await expect(story).toHaveAttribute('data-playback','complete');
  await expect(page.locator('.story-academic')).toBeVisible();
  await page.locator('.story-academic a').click();await expect(page).toHaveURL(/about/);
  expect(await page.evaluate(()=>document.documentElement.classList.contains('story-scroll-locked'))).toBe(false);
  await page.locator('.header-inner .brand').click();await expect(page.locator('main')).toHaveAttribute('data-scroll-mode',/natural|fullpage/);await goStory(page);
  await expect(page.locator('.story-card')).toHaveAttribute('data-playback',/idle|armed/);expect(errors).toEqual([]);
});
test('gesture arrival, keyboard completion, Escape and no scroll trap',async({page,isMobile})=>{
  test.skip(isMobile,'Desktop wheel/keyboard path; mobile uses explicit control and touch emulation elsewhere');
  await naturalHome(page);await expect(page.locator('.story-card')).toHaveAttribute('data-playback','idle');
  await goStory(page);await expect(page.locator('.story-card')).toHaveAttribute('data-playback','idle');
  await page.keyboard.press('ArrowDown');await expect(page.locator('.story-card')).toHaveAttribute('data-playback','complete');
  await page.keyboard.press('ArrowUp');await expect(page.locator('.story-card')).toHaveAttribute('data-playback','complete');
  await page.keyboard.press('Escape');await expect(page.locator('html')).not.toHaveClass(/story-scroll-locked/);
});
test('client route transition cancels active playback and disposes the scroll lock',async({page,isMobile})=>{
  await naturalHome(page);await goStory(page);
  if(isMobile){
    await expect(page.locator('.story-static article')).toHaveCount(2);await expect(page.locator('.story-scroll')).toBeHidden();
    await page.locator('.story-static article').first().getByRole('link').click();await expect(page).toHaveURL(/about/);
    await expect(page.locator('html')).not.toHaveClass(/story-scroll-locked/);return;
  }
  await expect(page.locator('.story-card')).toHaveAttribute('data-playback',/idle|armed/);
  await page.locator('video').evaluate((video:HTMLVideoElement)=>{video.playbackRate=0.1;});
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.story-card')).toHaveAttribute('data-playback','playing');
  await page.evaluate(()=>{document.body.dataset.routeMarker='preserved';});
  if(isMobile) await page.locator('.menu-toggle').click();
  await page.getByRole('navigation',{name:isMobile?'منوی موبایل':'منوی اصلی'}).getByRole('link',{name:'درباره پزشک',exact:true}).click();
  await expect(page).toHaveURL(/about/);await expect(page.locator('.story-card')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/story-scroll-locked/);
  await expect(page.locator('body')).toHaveAttribute('data-route-marker','preserved');
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
});
test('mobile shows two static profiles without fetching video or locking touch scrolling',async({page,browser},info)=>{
  await page.setViewportSize({width:393,height:851});const media:string[]=[];
  page.on('request',r=>{if(r.url().includes('.mp4'))media.push(r.url());});
  await page.goto('/');await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');
  await expect(page.locator('.story-static')).toBeVisible();await expect(page.locator('.story-scroll')).toBeHidden();
  await expect(page.locator('.story-play')).toHaveCount(0);await expect(page.locator('video')).not.toHaveAttribute('src',/.+/);
  const profiles=page.locator('.story-static article');await expect(profiles).toHaveCount(2);
  await expect(profiles.nth(0).locator('.story-static-portrait')).toBeHidden();
  await expect(profiles.nth(1).locator('.story-static-portrait')).toBeHidden();
  const first=(await profiles.nth(0).boundingBox())!,second=(await profiles.nth(1).boundingBox())!;expect(second.y).toBeGreaterThan(first.y+first.height);
  for(let i=0;i<2;i++){await profiles.nth(i).scrollIntoViewIfNeeded();await expect(profiles.nth(i).getByRole('link')).toBeVisible();await page.screenshot({path:info.outputPath('mobile-profile-'+i+'.png')});}
  expect(media).toEqual([]);await expect(page.locator('html')).not.toHaveClass(/story-scroll-locked|fullpage-enabled/);
  const context=await browser.newContext({hasTouch:true,viewport:{width:393,height:851}});const touchPage=await context.newPage();await touchPage.goto('/#about');
  const cdp=await context.newCDPSession(touchPage);const before=await touchPage.evaluate(()=>scrollY);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:650}]});
  for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:650-i*30}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(()=>touchPage.evaluate(()=>scrollY)).toBeGreaterThan(before);await context.close();
});

test('resizing active desktop playback to mobile disposes it and restores desktop on return',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/#about');await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');
  await page.locator('video').evaluate((v:HTMLVideoElement)=>{v.playbackRate=.1;});await page.keyboard.press('ArrowDown');
  await expect(page.locator('.story-card')).toHaveAttribute('data-playback','playing');await page.setViewportSize({width:393,height:851});
  await expect(page.locator('.story-static')).toBeVisible();await expect(page.locator('video')).not.toHaveAttribute('src',/.+/);
  await expect(page.locator('html')).not.toHaveClass(/story-scroll-locked|fullpage-enabled/);
  await page.setViewportSize({width:1440,height:900});await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');
  await expect(page.locator('.story-scroll')).toBeVisible();await expect(page.locator('video')).toHaveAttribute('src','/assets/doctor-turn-flow.mp4');
});

test('reduced motion and media failure both keep the page usable',async({page,isMobile})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('.story-static')).toBeVisible();await expect(page.locator('.story-scroll')).toBeHidden();
  await page.emulateMedia({reducedMotion:'no-preference'});await page.route('**/doctor-turn-flow.mp4',r=>r.abort());await naturalHome(page);await goStory(page);
  if(isMobile){await expect(page.locator('.story-static')).toBeVisible();await expect(page.locator('video')).not.toHaveAttribute('src',/.+/);return;}
  await expect(page.locator('.story-card')).toHaveAttribute('data-playback',/failed|idle|armed/);
  await page.keyboard.press('ArrowDown');await expect(page.locator('html')).not.toHaveClass(/story-scroll-locked/,{timeout:10000});
  await expect(page.locator('.story-poster')).toBeVisible();
});
test('changing reduced motion during playback releases the page',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await naturalHome(page);await goStory(page);
  await expect(page.locator('.story-card')).toHaveAttribute('data-playback',/idle|armed/);
  await page.locator('video').evaluate((video:HTMLVideoElement)=>{video.playbackRate=0.1;});
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.story-card')).toHaveAttribute('data-playback','playing');
  await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.story-static')).toBeVisible();
  await expect(page.locator('html')).not.toHaveClass(/story-scroll-locked/);
  await page.emulateMedia({reducedMotion:'no-preference'});await expect(page.locator('.story-card')).toHaveAttribute('data-playback',/idle|armed/);
});
test('WCAG automated checks on all page types',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of ['/','/about/','/expertise/','/publications/','/contact/']){
    await page.goto(route);const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(results.violations,route+'\n'+JSON.stringify(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))).toEqual([]);
  }
});
test('current hero preserves the content portrait and useful actions',async({page},info)=>{
  await naturalHome(page);await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:info.outputPath('modern-hero.png')});
  if(page.viewportSize()!.width<768)await expect(page.locator('.hero-reference-visual')).toBeHidden();
  else await expect(page.locator('.hero-reference-portrait img')).toBeVisible();
  await expect(page.getByRole('link',{name:'مشاهده نمونه‌کارها'})).toHaveAttribute('href','/gallery/');
});
test('short phone, tablet and desktop keep the full doctor visual visible',async({page},info)=>{
  for(const [width,height] of [[360,640],[768,1024],[1440,600]]){
    await page.setViewportSize({width,height});await naturalHome(page);await goStory(page);
    if(width<=768){
      await expect(page.locator('.story-scroll')).toBeHidden();
      for(const article of await page.locator('.story-static article').all()){
        await article.scrollIntoViewIfNeeded();if(width<768)await expect(article.locator('.story-static-portrait')).toBeHidden();else await expect(article.getByRole('img')).toBeVisible();
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.screenshot({path:info.outputPath('story-'+width+'x'+height+'.png')});continue;
    }
    await expect(page.locator('.story-card')).toHaveAttribute('data-playback',/idle|armed/);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.story-card')).toHaveAttribute('data-playback',/armed|playing|complete/);
    if(await page.locator('.story-card').getAttribute('data-playback')==='armed')await page.keyboard.press('ArrowDown');
    await expect(page.locator('.story-card')).toHaveAttribute('data-playback','complete');
    const frame=(await page.locator('.frame-stage').boundingBox())!;
    const header=(await page.locator('.header-inner').boundingBox())!;
    expect(frame.y).toBeGreaterThanOrEqual(header.height);expect(frame.y+frame.height).toBeLessThanOrEqual(height-8);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:info.outputPath('story-'+width+'x'+height+'.png')});
  }
});
test('content survives JavaScript disabled and unknown routes return 404',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'});const page=await context.newPage();await page.goto(baseURL!+'/');await expect(page.locator('.story-static')).toBeVisible();await expect(page.getByRole('link',{name:'همهٔ مقالات و پژوهش‌ها ←'})).toBeVisible();await expect(page.getByText('آموزش اصول جراحی‌های اندودانتیکس',{exact:true})).toBeVisible();expect((await page.goto(baseURL!+'/missing/'))?.status()).toBe(404);await context.close();
});
