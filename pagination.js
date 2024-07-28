const puppeteer = require('puppeteer-extra');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: "./tmp"
    });
    const page = await browser.newPage();
    // waitUntil page is loaded then run is_disabled
    await page.goto('https://www.amazon.com/s?k=keyboards&page=18', 
        {waitUntil: 'load'});
    
    // detect if button is disabled
    const is_disabled = await page.$('.s-pagination-item.s-pagination-next.s-pagination-disabled') !== null;

    console.log(is_disabled);


})();