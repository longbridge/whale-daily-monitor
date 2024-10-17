/// 牌照记录

import puppeteer from "puppeteer";

export const getLicencesData = async (ceref: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/corp/${ceref}/licences`, {
    waitUntil: "networkidle2",
  });

  const licRecordData = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return window.licRecordData;
  });
  await browser.close();

  return licRecordData;
};
