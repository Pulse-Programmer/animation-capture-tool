import { chromium, devices } from 'playwright';
import path from 'node:path';
import { writeFileSync } from 'node:fs';

const pagePath = path.resolve('public/index.html');
const url = `file://${pagePath}`;

const matrix = [
  { name: 'iPhone SE', ...devices['iPhone SE'] },
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'Pixel 5', ...devices['Pixel 5'] },
  { name: 'Galaxy S9+', ...devices['Galaxy S9+'] },
  { name: 'iPad Mini', ...devices['iPad Mini'] },
  { name: 'iPad Pro 11', ...devices['iPad Pro 11'] }
];

const browser = await chromium.launch({ headless: true });
const report = [];

for (const device of matrix) {
  const context = await browser.newContext({ ...device });
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1100);

  const checks = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflow = Math.max(doc.scrollWidth - doc.clientWidth, body.scrollWidth - body.clientWidth);

    const interactive = Array.from(document.querySelectorAll('a,button,[role="button"],input,textarea,select,.tab'));
    const targetViolations = interactive
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          className: el.className,
          width: Number(rect.width.toFixed(1)),
          height: Number(rect.height.toFixed(1)),
          text: (el.textContent || '').trim().slice(0, 40)
        };
      })
      .filter((x) => x.width > 0 && x.height > 0 && (x.width < 44 || x.height < 44));

    const menuToggleVisible = (() => {
      const el = document.querySelector('.menu-toggle');
      if (!el) return false;
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0;
    })();

    return {
      overflow,
      targetViolations,
      tabCount: document.querySelectorAll('.tab').length,
      menuToggleVisible,
      heroButtonsStacked: (() => {
        const actions = document.querySelector('.hero-actions');
        if (!actions) return false;
        const buttons = actions.querySelectorAll('.btn');
        if (buttons.length < 2) return false;
        const top0 = buttons[0].getBoundingClientRect().top;
        const top1 = buttons[1].getBoundingClientRect().top;
        return Math.abs(top1 - top0) > 8;
      })(),
      navOpenClass: (() => {
        const nav = document.querySelector('.nav-links');
        return nav ? nav.classList.contains('open') : false;
      })()
    };
  });

  if (checks.menuToggleVisible) {
    await page.click('.menu-toggle');
    await page.waitForTimeout(200);
  }

  await page.screenshot({ path: `output/playwright/${device.name.replace(/\s+/g, '-').toLowerCase()}.png`, fullPage: true });

  report.push({
    device: device.name,
    viewport: device.viewport,
    overflowPx: checks.overflow,
    tinyTargetCount: checks.targetViolations.length,
    tinyTargets: checks.targetViolations.slice(0, 8),
    menuToggleVisible: checks.menuToggleVisible,
    heroButtonsStacked: checks.heroButtonsStacked,
    tabCount: checks.tabCount
  });

  await context.close();
}

await browser.close();
writeFileSync('output/playwright/mobile-qa-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
