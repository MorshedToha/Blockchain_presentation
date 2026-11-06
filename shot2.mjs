import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/tmp/debs/pw/chromium_headless_shell-1148/chrome-linux/headless_shell' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs=[]; p.on('pageerror', e=>errs.push(e.message));
for (const [h,n] of [['1.0','t0'],['1.1','t1'],['1.2','t2'],['2.2','s1']]){
  await p.goto('about:blank'); await p.goto('file:///home/user/sandbox/dist/index.html#/'+h);
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `/home/user/sandbox/.shots/${n}.png` });
}
console.log('errors', errs); await b.close();
