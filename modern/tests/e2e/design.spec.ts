import {test,expect} from '@playwright/test';

test('homepage gives the gallery priority and exposes the complete navigation',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');
  await expect(page.locator('main>section')).toHaveCount(8);
  expect(await page.locator('main>section').evaluateAll(nodes=>nodes.map(node=>node.id))).toEqual(['introduction','experience','portfolio','services','about','patient-journey','research','contact']);
  await expect(page.locator('.hero-reference-actions a').first()).toHaveAttribute('href','/gallery/');
  await page.setViewportSize({width:390,height:900});await page.locator('.menu-toggle').click();
  expect(await page.locator('#mobile-nav a').allTextContents()).toEqual(['خانه','نمونه‌کارها','خدمات','درباره پزشک','راهنمای بیماران','مقالات','تماس با مطب']);
  expect((await page.goto('/blog/'))?.status()).toBe(200);expect((await page.goto('/blog/finding-research/'))?.status()).toBe(200);
  expect((await page.goto('/blog/first-consultation/'))?.status()).toBe(404);
});

test('empty gallery displays no patient images and provides a contact destination',async({page})=>{
  await page.goto('/gallery/');await expect(page.locator('.gallery-empty')).toBeVisible();
  await expect(page.locator('main img')).toHaveCount(0);await expect(page.locator('.portfolio-track,.portfolio-pause')).toHaveCount(0);
  await expect(page.locator('.gallery-empty a')).toHaveAttribute('href','/contact/');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#journey');
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');
  await expect(page.locator('#portfolio h2')).toBeInViewport();
});

test('mobile menu isolates the background and releases it on Escape, resize and navigation',async({page})=>{
  await page.setViewportSize({width:390,height:900});await page.goto('/about/');
  const toggle=page.getByRole('button',{name:'باز کردن منو'});
  await toggle.click();await expect(page.locator('#page-shell')).toHaveAttribute('inert','');
  await expect(page.locator('#mobile-nav a').first()).toBeFocused();
  await page.keyboard.press('Escape');await expect(toggle).toBeFocused();
  await expect(page.locator('#page-shell')).not.toHaveAttribute('inert','');
  await toggle.click();await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('#mobile-nav')).toBeHidden();await expect(page.locator('#page-shell')).not.toHaveAttribute('inert','');
  await page.setViewportSize({width:390,height:900});await toggle.click();
  await page.locator('#mobile-nav').getByRole('link',{name:'درباره پزشک'}).click();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator('#mobile-nav').getByRole('link',{name:'مقالات'}).click();
  await expect(page).toHaveURL(/\/blog\/$/);await expect(page.locator('#page-shell')).not.toHaveAttribute('inert','');
  await expect(page.locator('body')).not.toHaveCSS('overflow','hidden');
});

test('empty research results offer a complete reset',async({page})=>{
  await page.goto('/publications/');await page.getByLabel('حوزهٔ پژوهش').selectOption('ایمپلنت دندانی');
  await page.getByLabel('ترتیب نمایش').selectOption('oldest');await page.getByRole('searchbox').fill('no-match');
  await page.getByRole('button',{name:'نمایش همهٔ پژوهش‌ها'}).click();
  await expect(page.getByRole('article')).toHaveCount(3);await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.getByLabel('حوزهٔ پژوهش')).toHaveValue('');await expect(page.getByLabel('ترتیب نمایش')).toHaveValue('newest');
});

test('Persian research search is shareable and resetting preserves other URL parameters',async({page})=>{
  const url=new URLSearchParams({q:'۲۰۱۹',topic:'ایمپلنت دندانی',sort:'oldest',ref:'preview'});
  await page.goto('/publications/?'+url);
  const search=page.getByRole('searchbox');
  await expect(search).toHaveValue('۲۰۱۹');
  await expect(page.getByLabel('حوزهٔ پژوهش')).toHaveValue('ایمپلنت دندانی');
  await expect(page.getByLabel('ترتیب نمایش')).toHaveValue('oldest');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article')).toContainText('تحلیل استخوان');
  await search.fill('ايمپلنت ٢٠١٩');
  await expect(page.getByRole('article')).toHaveCount(1);
  await search.fill('٢٠١٩');
  await expect(page.getByRole('article')).toHaveCount(1);
  expect(new URL(page.url()).searchParams.get('q')).toBe('٢٠١٩');
  await page.reload();
  await expect(search).toHaveValue('٢٠١٩');
  await page.getByRole('button',{name:'پاک کردن فیلترها'}).click();
  await expect(search).toBeFocused();
  await expect(page).toHaveURL(/\/publications\/\?ref=preview$/);
  await expect(page.getByRole('article')).toHaveCount(3);
});

test('keyboard skip and footer return move to the intended location on content pages',async({page})=>{
  await page.goto('/contact/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  const top=page.getByRole('link',{name:/بازگشت به بالا/});
  await top.scrollIntoViewIfNeeded();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(0);
  await top.click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
});

test('entrance progress follows natural scrolling in both directions and pauses in place',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/blog/');
  await page.evaluate(()=>document.fonts.ready);
  const card=page.locator('.research-card').first();
  const entry=await card.evaluate(el=>el.getBoundingClientRect().top+scrollY-innerHeight);
  expect(entry).toBeGreaterThan(0);
  const scrollToEntry=(pixels:number)=>page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),entry+pixels);
  const read=()=>card.evaluate(el=>{
    const animation=el.getAnimations().find(item=>item.id==='clinic-arrival');
    return animation ? Number(animation.currentTime) : null;
  });

  await scrollToEntry(24);
  await expect.poll(read).toBeGreaterThan(0);
  const first=await read();
  await card.evaluate(()=>new Promise(resolve=>setTimeout(resolve,200)));
  expect(await read()).toBe(first);
  await scrollToEntry(60);
  await expect.poll(read).toBeGreaterThan(first!);
  await scrollToEntry(24);
  await expect.poll(read).toBeCloseTo(first!);
  await scrollToEntry(220);
  await expect.poll(read).toBeNull();
  await scrollToEntry(24);
  expect(await read()).toBeNull();
});

test('without JavaScript both profiles, route links and FAQ remain usable',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});
  const page=await context.newPage();const media:string[]=[];
  page.on('request',r=>{if(r.url().includes('.mp4'))media.push(r.url());});
  await page.goto('/');await expect(page.locator('.story-static')).toBeVisible();
  await expect(page.locator('.story-static article')).toHaveCount(2);await expect(page.locator('.story-scroll')).toBeHidden();
  await page.locator('.story-static article').first().getByRole('link').click();await expect(page).toHaveURL(/about/);
  await page.goto('/contact/');await page.locator('.faq-item summary').first().click();await expect(page.locator('.faq-answer').first()).toBeVisible();
  expect(media).toEqual([]);await context.close();
});
