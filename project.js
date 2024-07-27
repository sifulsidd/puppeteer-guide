const puppeteer = require('puppeteer-extra');

// // add stealth plugin and use defaults (all evasion techniques)
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

(async ()=>{
    // headless is so we can see what puppeteer is doing with chromium
    // defaultViewport is to make the size of the page take up all of the chromium tab
    // userDataDir is for a captcha, once we do it once, we can always access the website without issues 
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        userDataDir: "./tmp"
    });

    const page = await browser.newPage();
    await page.goto('https://www.amazon.com/s?k=amazonbasics&crid=3B45OHQ2R95Q4&sprefix=amazonbasics%2Caps%2C89&ref=nb_sb_noss_2');

    const items = [];
    const productsHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');
    
    for(const producthandle of productsHandles){
        // initializing the variables before let's us do multiple try-catch blocks for each value 
        // we do try-catch cause some locators don't have titles/prices/imgs
        let title = "Nothing";
        let price = "Nothing";
        let img = "Nothing";
        
        try{
            title = await page.evaluate(el => el.querySelector('h2 > a > span').textContent, producthandle);
        } catch(error){}

        try{
            price = await page.evaluate(el => el.querySelector('.a-price > .a-offscreen').textContent, producthandle);
        } catch(error){}

        try{
            img = await page.evaluate(el => el.querySelector('.s-image').getAttribute('src'), producthandle);
        } catch(error){}

        // by not setting values, it is taking the word we put in as the key and the result it gets from above as the value 
        if(title !== "Nothing"){
            items.push({title, price, img});
        }
    }
    console.log(items);
    console.log(items.length)

})();