import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport:{width:320,height:568}, hasTouch:false, isMobile:false });
const page = await context.newPage();
await page.goto('http://127.0.0.1:4173/index.html');
await page.waitForTimeout(400);

const data = await page.evaluate(() => {
  const cw = document.documentElement.clientWidth;
  const arr = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0) continue;
    if (r.right > cw + 1 || r.left < -1) {
      arr.push({
        tag: el.tagName.toLowerCase(),
        cls: el.className,
        id: el.id,
        l: Math.round(r.left),
        r: Math.round(r.right),
        w: Math.round(r.width),
        csw: getComputedStyle(el).width,
        pos: getComputedStyle(el).position,
        ow: getComputedStyle(el).overflowX,
      });
    }
  }
  return { cw, sw: document.documentElement.scrollWidth, offenders: arr.slice(0, 40)};
});

console.log(JSON.stringify(data, null, 2));
await context.close();
await browser.close();
