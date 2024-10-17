/// 条件

import puppeteer from "puppeteer";

export const getConditionsData = async (ceref: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/corp/${ceref}/conditions`, {
    waitUntil: "networkidle2",
  });

  const condData = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return window.condData;
  });
  await browser.close();

  return condData;
};
