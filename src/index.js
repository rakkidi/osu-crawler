import { createOsuBeatmapScraper } from "./OsuBeatmapScraper";
// eslint-disable-next-line
import URLData from "../data/out/urls.json" assert { type: "json" };

const run = async () => {
  const { urls } = URLData;

  const scraper = createOsuBeatmapScraper();
  await scraper.start(true);
  await scraper.login();

  const slicedUrls = urls.slice(100, 270);
  // console.log(slicedUrls);
  const megaLinks = await scraper.getMegaLinks(slicedUrls, 0);
  console.log(megaLinks);
  //const megaLink = await scraper.getMegaLinkFromURL(urls[0]);
  // scraper.writeObjToJSON("./data/out/megalinks.json", megaLinks);
  // await page.screenshot({ path: "./data/out/login.png", fullPage: true });

  //const megaLinks = await scraper.getMegaLinks(urls);
  //console.log(megaLinks);

  //scraper.writeObjToJSON("./data/out/megalinks.json", megaLinks);

  // let pageNumber = await scraper.getPageNumber();

  //let beatmapURLs = await osuBS.getBeatmapURLsFromAllPages(pageNumber);
  // console.log(beatmapURLs);
  //await page.screenshot({ path: "test1.png", fullPage: true });
  //let beatmapURL = await osuBS.getBeatmapUrlsFromPage();
  // let beatmapurls = await scraper.getBeatmapURLsFromAllPages(pageNumber);
  // console.log(beatmapurls);

  await scraper.shutdown();
};
run();
