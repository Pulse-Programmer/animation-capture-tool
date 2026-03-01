import { chromium, devices } from 'playwright';
import path from 'node:path';

const url = `file://${path.resolve('public/index.html')}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...devices['iPhone SE'] });
const page = await context.newPage();
await page.goto(url);
await page.waitForTimeout(1200);

const offenders = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const all = Array.from(document.querySelectorAll('body *'));
  return all
    .map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        className: el.className,
        id: el.id,
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        position: cs.position,
        transform: cs.transform !== 'none' ? cs.transform : null,
        overflowX: cs.overflowX,
      };
    })
    .filter((x) => x.width > 0 && (x.left < -1 || x.right > vw + 1))
    .sort((a,b) => (b.right - a.right) - (a.left - b.left))
    .slice(0, 25);
});

console.log(JSON.stringify({ viewport: devices['iPhone SE'].viewport, offenders }, null, 2));
await context.close();
await browser.close();
