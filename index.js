const puppeteer = require("puppeteer");
const _ = require("lodash");
const fs = require("fs");
const util = require("util");

const categories = [
  "road",
  "mountain",
  "active",
  "electric",
  "kids/1-to-4",
  "kids/4-to-6",
  "kids/5-to-8",
  "kids/7-to-12",
];

const URL = 'https://www.cannondale.com/de-DE/bikes/';

const getCategory = async (category) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL + category, {waitUntil: 'networkidle2'});

    return page.evaluate(() => {
      const links = [];
      const products = document.querySelectorAll(".product-card .product");
      for (let i = 0; i < products.length; i++) {
        links.push(products[i].href);
      }

      return links;
    }).then(async (links) => {
      await browser.close();
      console.log("Get cannondale category: ", category);
      return {
        key: category,
        content: links
      };
    });

  } catch (e) {
    console.log("Puppeteer launch error: ", e);
  }
};

(async () => {
  const bikeModels = await Promise.all(_.map(categories, (category) => getCategory(category)));
  await util.promisify(fs.writeFile)("cannondale_categories.json", JSON.stringify(bikeModels));
})();
