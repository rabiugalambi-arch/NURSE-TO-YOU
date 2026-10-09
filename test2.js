import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('RESPONSE FAIL:', response.status(), response.url());
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  const html = await page.content();
  console.log('HTML CONTENT SNIPPET:', html.substring(0, 1000));
  if (html.includes('Something went wrong')) {
     console.log('ERROR BOUNDARY TRIGGERED');
     const errorText = await page.evaluate(() => document.body.innerText);
     console.log('BODY:', errorText);
  }
  await browser.close();
})();
