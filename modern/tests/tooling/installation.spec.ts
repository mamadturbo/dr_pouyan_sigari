import {test, expect} from '@playwright/test';

test('browser starts, renders Persian RTL, emulates reduced motion and saves a screenshot', async ({page, browser, browserName, context}, info) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.setContent('<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>آزمایش ابزار</title></head><body><button type="button" onclick="this.textContent=\'موفق\'">آزمایش</button></body></html>');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.getByRole('button').click();
  await expect(page.getByRole('button')).toHaveText('موفق');
  if (browserName === 'chromium') {
    const cdp = await context.newCDPSession(page);
    try {
      await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 100, downloadThroughput: 200000, uploadThroughput: 100000});
      await cdp.send('Performance.enable');
      expect((await cdp.send('Performance.getMetrics')).metrics.length).toBeGreaterThan(0);
    } finally {
      await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
      await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1});
      await cdp.detach();
    }
  }
  await page.screenshot({path: info.outputPath('browser-installation.png')});
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await info.attach('engine-version.json', {body: JSON.stringify({browserName, version: browser.version()}), contentType: 'application/json'});
  await page.screenshot({path: info.outputPath('site-engine.png')});
});
