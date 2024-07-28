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
    await page.goto('https://www.amazon.com/s?k=keyboards&page=20', {waitUntil: 'load'});
    
    // detect if button is disabled
    const is_disabled = await page.$('span.s-pagination-strip > .s-pagination-item.s-pagination-next.s-pagination-disabled') !== null;
    if(!is_disabled){
        // had to figure out a path to button that will be true regardless of it is is disabled or not
        await page.click('span.s-pagination-strip > .s-pagination-item.s-pagination-next');
        console.log(is_disabled);
    }
    console.log(is_disabled);


})();