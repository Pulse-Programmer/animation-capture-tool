import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const sizes = [[320,568],[360,740],[390,844],[412,915]];
for (const [w,h] of sizes) {
  const context = await browser.newContext({ viewport:{width:w,height:h}, hasTouch:false, isMobile:false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/index.html');
  await page.waitForTimeout(300);
  const m = await page.evaluate(()=>({cw:document.documentElement.clientWidth, sw:document.documentElement.scrollWidth}));
  console.log(w,h,m);
  await context.close();
}
await browser.close();
