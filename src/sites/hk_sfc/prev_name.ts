/// 前称

import puppeteer from "puppeteer";

export const getPrevNameData = async (ceref: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/corp/${ceref}/prev_name`, {
    waitUntil: "networkidle2",
  });

  const prevNameData = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return window.prevNameData;
  });
  await browser.close();

  return prevNameData;
};
