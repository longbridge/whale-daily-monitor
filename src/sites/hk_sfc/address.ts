/// 地址
import puppeteer from "puppeteer";

export const getAddress = async (ceref: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/corp/${ceref}/addresses`, {
    waitUntil: "networkidle2",
  });
  const globalVariable = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    return {
      // @ts-ignore
      address: window.addressData,
      // @ts-ignore
      email: window.emailData,
      // @ts-ignore
      website: window.websiteData,
    };
  });
  await browser.close();

  return globalVariable;
};
