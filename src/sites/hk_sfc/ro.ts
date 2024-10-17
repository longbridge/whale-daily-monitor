/// 负责人员
import puppeteer from "puppeteer";

export const getRoData = async (ceref: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/corp/${ceref}/ro`, {
    waitUntil: "networkidle2",
  });

  const roRawData = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return window.rorawData;
  });
  await browser.close();

  return roRawData;
};
