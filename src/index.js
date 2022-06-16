import { createOsuBeatmapScraper } from "./OsuBeatmapScraper";
// eslint-disable-next-line
import URLData from "../data/out/urls.json" assert { type: "json" };

const run = async () => {
  const { urls } = URLData;

  const scraper = createOsuBeatmapScraper();
  await scraper.start(true);
  await scraper.login();

  const slicedUrls = urls.slice(100, 270);

  const megaLinks = await scraper.getAllMegaLinks(slicedUrls, 0);
  console.log(megaLinks);

  await scraper.shutdown();
};

run();
