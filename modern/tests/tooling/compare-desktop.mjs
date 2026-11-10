import {chromium} from '@playwright/test';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.resolve('next/package.json'))('sharp');
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://127.0.0.1:4175/');await page.waitForLoadState('networkidle');
await page.screenshot({path:'qa-artifacts/responsive-implementation/after-1440.png',fullPage:true});
const a=await sharp('qa-artifacts/responsive-implementation/before-1440.png').raw().toBuffer({resolveWithObject:true});const b=await sharp('qa-artifacts/responsive-implementation/after-1440.png').raw().toBuffer({resolveWithObject:true});
let pixels=0;for(let i=0;i<a.data.length;i+=a.info.channels)if(a.data.subarray(i,i+a.info.channels).some((v,j)=>Math.abs(v-b.data[i+j])>2))pixels++;
await writeFile('qa-artifacts/responsive-implementation/desktop-comparison.json',JSON.stringify({before:a.info,after:b.info,changedPixels:pixels,totalPixels:a.info.width*a.info.height},null,2));
for(let i=1;i<8;i++){await page.locator('.presentation-navigation button').nth(i).click();await page.waitForFunction(()=>document.querySelector('#page-shell').dataset.transitioning==='false');await page.screenshot({path:`qa-artifacts/responsive-implementation/desktop-panel-${i}.png`});}
await browser.close();
