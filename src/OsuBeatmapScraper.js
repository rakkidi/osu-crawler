import { writeFileSync } from "fs";
import puppeteer from "puppeteer";
import logger from "./logger.js";

import dotenv from "dotenv";
dotenv.config();

export function createOsuBeatmapScraper() {
  let browser;
  let page;
  let loggedIn = false;

  async function start(headless = true) {
    logger.info("Start page in puppeter browser");
    browser = await puppeteer.launch({ headless: headless });
    page = await browser.newPage();
    page.setDefaultTimeout(60000);
  }

  async function shutdown() {
    if (!page || !browser)
      logger.warn("Browser or Page is not defined... shutdown aborted.");

    await page.close();
    await browser.close();
  }

  const login = async () => {
    logger.info("Go to page: https://osu.ppy.sh/beatmaps/packs");
    await page.goto("https://osu.ppy.sh/beatmaps/packs");

    await page.screenshot({ path: "1.png" });

    await page.click("[data-click-menu-target=mobile-menu]");
    await page.click(
      "body > div.visible-xs.no-print.js-header--main > div.mobile-menu.js-click-menu.u-fancy-scrollbar.js-click-menu--active > div > div.mobile-menu__tabs > button.mobile-menu-tab.mobile-menu-tab--user.js-user-link"
    );

    await page.type("[name=username]", process.env.USER);
    await page.type("[name=password]", process.env.PASSWORD);

    await page.click(
      "body > div.login-box > div > form > div.login-box__row.login-box__row--actions > div > button"
    );

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    loggedIn = true;
  };

  const isLoggedIn = () => {
    if (!loggedIn) logger.warn("User is not logged in.");
    return loggedIn;
  };

  async function getPage() {
    if (!isLoggedIn) return;
    return page;
  }

  /** Get the page number from the pagination
   * This function only works if your page is currently at https://osu.ppy.sh/beatmaps/packs
   * and your are logged in
   * @param {*} page
   */
  async function getPageNumber() {
    if (!isLoggedIn) return;
    return await page.evaluate(() => {
      return parseInt(
        document.querySelectorAll(".pagination-v2__link")[5].innerHTML
      );
    });
  }

  async function goToNextPage() {
    if (!isLoggedIn) return;
    try {
      await page.click(
        "body > div.osu-layout__section.osu-layout__section--full.js-content.beatmaps_index > div:nth-child(3) > div > div.beatmap-packs__pager > nav > div:nth-child(3) > a"
      );
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log(e);
      await page.screenshot({ path: "Error.png", fullPage: true });
    }
  }

  async function writeObjToJSON(
    path = "./data/out/urls.json",
    dataObjName = "data",
    dataObject
  ) {
    var obj = {
      [dataObjName]: dataObject,
    };

    var json = JSON.stringify(obj);
    try {
      writeFileSync(path, json);
      logger.info("Saved URLs JSON in: ", path);
    } catch (error) {
      logger.error(error);
    }
  }

  async function getBeatmapUrlsPage() {
    if (!isLoggedIn) return;
    const urls = await page.evaluate(() => {
      const beatmap_pack = document.querySelectorAll(
        "body > div.osu-layout__section.osu-layout__section--full.js-content.beatmaps_index > div:nth-child(3) > div > div"
      );

      // Goes inside the HTML Element, filters it for the relevant name and map the href
      const urls = Array.from(beatmap_pack)
        .filter((node) =>
          node.children[0].children[0].innerText.match(/^Beatmap Pack #\d*/)
        )
        .map((node) => node.children[0].href);

      return urls;
    });
    return urls;
  }

  async function getBeatmapURLs(pageNumbers) {
    if (!isLoggedIn) return;

    let urls = [];

    for (let i = 0; i < pageNumbers; i++) {
      const pageURLs = await getBeatmapUrlsPage();
      urls = [...urls, ...pageURLs];

      await goToNextPage();
    }

    return urls;
  }

  async function getMegaLinkFromURL(url) {
    if (!isLoggedIn) return;
    try {
      await page.goto(url);
      page.waitForNavigation({ waitUntil: "networkidle2" });

      // await page.screenshot({ path: "data/out/" + "test.png" });

      const href = await page.evaluate(() => {
        return document.querySelector(
          "body > div.osu-layout__section.osu-layout__section--full.js-content.beatmaps_show > div:nth-child(3) > div > div > div > div > a"
        ).href;
      });
      console.log(href);
      return href;
    } catch (e) {
      console.log(e);
      return "";
    }
  }

  async function getMegaLinks(beatmapURLs, delay = 3000) {
    if (!isLoggedIn) return;

    let megaLinks = [];

    for (let url of beatmapURLs) {
      const megaLink = await getMegaLinkFromURL(url);
      megaLinks.push(megaLink);
      await new Promise((r) => setTimeout(r, delay));
    }

    return megaLinks;
  }

  return {
    start,
    shutdown,
    login,
    getPage,
    getPageNumber,
    getBeatmapUrlsPage,
    getBeatmapURLs,
    getMegaLinkFromURL,
    getMegaLinks,
    writeObjToJSON,
  };
}
