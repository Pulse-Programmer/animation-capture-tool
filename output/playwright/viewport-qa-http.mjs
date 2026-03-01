import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const url = 'http://127.0.0.1:4173/index.html';
const sizes = [
  { name: 'w320-h568', width: 320, height: 568 },
  { name: 'w360-h740', width: 360, height: 740 },
  { name: 'w390-h844', width: 390, height: 844 },
  { name: 'w412-h915', width: 412, height: 915 },
  { name: 'w768-h1024', width: 768, height: 1024 },
  { name: 'w834-h1194', width: 834, height: 1194 }
];

const browser = await chromium.launch({ headless: true });
const report = [];

for (const s of sizes) {
  const context = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    isMobile: s.width <= 430,
    hasTouch: s.width <= 1024,
    deviceScaleFactor: s.width <= 430 ? 3 : 2
  });

  const page = await context.newPage();
  await page.goto(url);
  await page.waitForTimeout(1000);

  const checks = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflow = Math.max(doc.scrollWidth - doc.clientWidth, body.scrollWidth - body.clientWidth);

    const interactive = Array.from(document.querySelectorAll('a,button,[role="button"],input,textarea,select,.tab'));
    const tiny = interactive
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          className: el.className,
          text: (el.textContent || '').trim().slice(0, 30),
          width: Number(r.width.toFixed(1)),
          height: Number(r.height.toFixed(1))
        };
      })
      .filter((x) => x.width > 0 && x.height > 0 && (x.width < 44 || x.height < 44));

    return {
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      overflow,
      tiny,
      tinyCount: tiny.length,
      menuVisible: (() => {
        const el = document.querySelector('.menu-toggle');
        if (!el) return false;
        return getComputedStyle(el).display !== 'none';
      })()
    };
  });

  await page.screenshot({ path: `output/playwright/${s.name}-http.png`, fullPage: true });
  report.push({ ...s, ...checks, tiny: checks.tiny.slice(0, 6) });
  await context.close();
}

await browser.close();
writeFileSync('output/playwright/viewport-qa-http-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
