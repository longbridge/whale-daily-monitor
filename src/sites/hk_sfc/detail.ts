/// 牌照详情

import puppeteer from "puppeteer";
import { writeFile, readJsonFile } from "../../fs";
import { get } from "lodash-es";

export const getDetailInfo = async (item: any) => {
  let ceref = get(item, "ceref");
  let info = {
    done: false,
  };
  const path = get(item, "isCorp") ? "corp" : get(item, "isRi") ? "ri" : "eo";
  try {
    const browser = await puppeteer.launch();
    await Promise.all([
      goDetail(browser, path, ceref),
      goAddress(browser, path, ceref),
      goCo(browser, path, ceref),
      goConditions(browser, path, ceref),
      goDa(browser, path, ceref),
      goLicences(browser, path, ceref),
      goPrevName(browser, path, ceref),
      goRep(browser, path, ceref),
      goRo(browser, path, ceref),
    ]);

    await browser.close();
  } catch (error) {
    console.log("🚀 ~ getDetail ~ error:", error);
  }

  return info;
};

const goDetail = async (browser: any, path: string, ceref: string) => {
  let info = {
    done: false,
  };
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/${path}/${ceref}/details`, {
    waitUntil: "networkidle2",
  });
  info = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    return {
      // @ts-ignore
      list: window.raDetailData,
      done: true,
    };
  });

  writeFile(info, `src/backup/hk_sfc/detail/${ceref}.json`);
};

const goAddress = async (browser: any, path: string, ceref: string) => {
  let info = {
    done: false,
  };
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(
    `https://apps.sfc.hk/publicregWeb/${path}/${ceref}/addresses`,
    {
      waitUntil: "networkidle2",
    }
  );
  info = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    return {
      // @ts-ignore
      address: window.addressData,
      // @ts-ignore
      email: window.emailData,
      // @ts-ignore
      website: window.websiteData,
      done: true,
    };
  });

  writeFile(info, `src/backup/hk_sfc/address/${ceref}.json`);
};

const goCo = async (browser: any, path: string, ceref: string) => {
  let info = {
    done: false,
  };
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/${path}/${ceref}/co`, {
    waitUntil: "networkidle2",
  });
  info = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return { list: window.cofficerData, done: true };
  });

  writeFile(info, `src/backup/hk_sfc/co/${ceref}.json`);
};

const goConditions = async (browser: any, path: string, ceref: string) => {
  let info = {
    done: false,
  };
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(
    `https://apps.sfc.hk/publicregWeb/${path}/${ceref}/conditions`,
    {
      waitUntil: "networkidle2",
    }
  );
  info = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return { list: window.condData, done: true };
  });

  writeFile(info, `src/backup/hk_sfc/conditions/${ceref}.json`);
};

const goDa = async (browser: any, path: string, ceref: string) => {
  let info = {
    done: false,
  };
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/${path}/${ceref}/da`, {
    waitUntil: "networkidle2",
  });
  info = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return { list: window.disRemarkData, done: true };
  });

  writeFile(info, `src/backup/hk_sfc/da/${ceref}.json`);
};
const goLicences = async (browser: any, path: string, ceref: string) => {
  let info = {
    done: false,
  };
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(
    `https://apps.sfc.hk/publicregWeb/${path}/${ceref}/licences`,
    {
      waitUntil: "networkidle2",
    }
  );
  info = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return { list: window.licRecordData, done: true };
  });

  writeFile(info, `src/backup/hk_sfc/licences/${ceref}.json`);
};
const goPrevName = async (browser: any, path: string, ceref: string) => {
  let info = {
    done: false,
  };
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(
    `https://apps.sfc.hk/publicregWeb/${path}/${ceref}/prev_name`,
    {
      waitUntil: "networkidle2",
    }
  );
  info = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return { list: window.prevNameData, done: true };
  });

  writeFile(info, `src/backup/hk_sfc/prev_name/${ceref}.json`);
};
const goRep = async (browser: any, path: string, ceref: string) => {
  let info = {
    done: false,
  };
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/${path}/${ceref}/rep`, {
    waitUntil: "networkidle2",
  });
  info = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return { list: window.reprawData, done: true };
  });

  writeFile(info, `src/backup/hk_sfc/rep/${ceref}.json`);
};
const goRo = async (browser: any, path: string, ceref: string) => {
  let info = {
    done: false,
  };
  const page = await browser.newPage();
  // Navigate the page to a URL.
  await page.goto(`https://apps.sfc.hk/publicregWeb/${path}/${ceref}/ro`, {
    waitUntil: "networkidle2",
  });
  info = await page.evaluate(() => {
    // 假设你要获取的全局变量名为 `globalVar`
    // @ts-ignore
    return { list: window.rorawData, done: true };
  });

  writeFile(info, `src/backup/hk_sfc/ro/${ceref}.json`);
};
