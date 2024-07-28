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
    await page.goto('https://www.amazon.com/s?k=keyboards&i=videogames&rh=n%3A468642%2Cp_123%3A2842122&dc&qid=1722137101&rnid=85457740011&ref=sr_pg_1');
    
    const items = [];
    const productsHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');
    
    for(const producthandle of productsHandles){
        let isBtnDisabled = false;
        while(!isBtnDisabled){
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
            
            await page.waitForSelector('span.s-pagination-strip > .s-pagination-item.s-pagination-next');
            // detect if button is disabled
            const is_disabled = await page.$('span.s-pagination-item.s-pagination-next.s-pagination-disabled') !== null;
            console.log("Can we continue T or F:", !is_disabled);
            // assign isBtnDisabled to whether or not the next button exists or not 
            isBtnDisabled = is_disabled;
            // if next button exists, basically click next 
            if(!is_disabled){
                await page.click('span.s-pagination-strip > .s-pagination-item.s-pagination-next');
            }
        }
    }
    console.log(items, items.length);

})();