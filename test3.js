import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Click "I am a Patient"
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Patient')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  
  const html = await page.content();
  if (html.includes('Something went wrong')) {
     console.log('ERROR BOUNDARY TRIGGERED (Patient)');
     const errorText = await page.evaluate(() => document.body.innerText);
     console.log('BODY:', errorText);
  } else {
     console.log('Patient loaded without error boundary');
  }

  await browser.close();
})();
