import puppeteer from 'puppeteer';

const testPuppeteer = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent('<h1>Hello, Puppeteer!</h1>');
  await page.screenshot({ path: 'test-puppeteer.png' });
  await browser.close();
  console.log("✅ Screenshot created successfully!");
};

testPuppeteer();
