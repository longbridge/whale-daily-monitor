/// 公开纪律行动

import puppeteer from "puppeteer";

export const getDaData = async (ceref: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/corp/${ceref}/da`, {
    waitUntil: "networkidle2",
  });

  const disRemarkData = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return window.disRemarkData;
  });
  await browser.close();

  return disRemarkData;
};
