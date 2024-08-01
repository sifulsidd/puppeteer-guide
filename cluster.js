const { Cluster } = require("puppeteer-cluster");
const fs = require("fs");

const urls = [
  "https://www.amazon.com/s?k=bug+spray&crid=3J1UFCL3EP5ZN&sprefix=bug+spray+%2Caps%2C103&ref=nb_sb_noss_2",
  "https://www.amazon.com/s?k=bear+spray&crid=1S7CRGUVPJR9M&sprefix=bear+spray%2Caps%2C134&ref=nb_sb_noss_1",
];

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 2,
    // pass in same parameters we'd use in puppeteer.launch into this key value pair called puppeteer.
    puppeteerOptions: {
      headless: false,
      // this gives us a rundown of how our application is running   
      monitor: true,
      defaultViewport: false,
      userDataDir: "./tmp",
    },
  });

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);

    const items = [];
    let isBtnDisabled = false;
    while (!isBtnDisabled) {
      // basically as long as the page loads it takes any information it can
      // wait for the next button to load
      await page.waitForSelector(
        "span.s-pagination-strip > .s-pagination-item.s-pagination-next"
      );
      const productsHandles = await page.$$(
        "div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item"
      );
      // loop through each item of product page
      for (const producthandle of productsHandles) {
        // initializing the variables before let's us do multiple try-catch blocks for each value
        // we do try-catch cause some locators don't have titles/prices/imgs
        let title = "Nothing";
        let price = "Nothing";
        let img = "Nothing";

        try {
          title = await page.evaluate(
            (el) => el.querySelector("h2 > a > span").textContent,
            producthandle
          );
        } catch (error) {}

        try {
          price = await page.evaluate(
            (el) => el.querySelector(".a-price > .a-offscreen").textContent,
            producthandle
          );
        } catch (error) {}

        try {
          img = await page.evaluate(
            (el) => el.querySelector(".s-image").getAttribute("src"),
            producthandle
          );
        } catch (error) {}

        // by not setting values, it is taking the word we put in as the key and the result it gets from above as the value
        if (title !== "Nothing") {
          items.push({ title, price, img });
          fs.appendFile(
            "clusterResults.csv",
            `${title.replace(/,/g, " ")}, ${price}, ${img}\n`,
            function (err) {
              if (err) throw err;
            //   console.log("saved");
            }
          );
        }
      }
      // console.log(items.length);

      // detect if button is disabled
      const is_disabled =
        (await page.$(
          "span.s-pagination-item.s-pagination-next.s-pagination-disabled"
        )) !== null;

      // assign isBtnDisabled to whether or not the next button exists or not
      isBtnDisabled = is_disabled;
      // if next button exists, basically click next
      if (!is_disabled) {
        await page.click(
          "span.s-pagination-strip > .s-pagination-item.s-pagination-next"
        );
      }
    }
  });

  for (const url of urls) {
    await cluster.queue(url);
  }
  // many more pages

    await cluster.idle();
    await cluster.close();
})();
