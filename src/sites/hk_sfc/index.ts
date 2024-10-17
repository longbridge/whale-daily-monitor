import { get, uniqBy } from "lodash-es";
import { API } from "../../api";
import config from "../../config/hk_sfc";
import { writeFile } from "../../fs";
import { getDetail } from "./detail";
import { getAddress } from "./address";
import { getRoData } from "./ro";
import { getRepData } from "./rep";
import { getCofficerData } from "./co";
import { getConditionsData } from "./conditions";
import { getDaData } from "./da";
import { getLicencesData } from "./licences";
import { upsert, insert } from "../../supabase/connect";

// 名称开头
const nameStartLetterMap = [
  "A",
  "B",
  "C",
  // "D",
  // "E",
  // "F",
  // "G",
  // "H",
  // "I",
  // "J",
  // "K",
  // "L",
  // "M",
  // "N",
  // "O",
  // "P",
  // "Q",
  // "R",
  // "S",
  // "T",
  // "U",
  // "V",
  // "W",
  // "X",
  // "Y",
  // "Z",
  // "1",
  // "2",
  // "3",
  // "4",
  // "5",
  // "6",
  // "7",
  // "8",
  // "9",
  // "0",
];

// 《證券及期貨條例》下的牌照
const ratypeMap = [1]; // , 2, 3, 4, 5, 6, 7, 8, 9, 10, 13

// 《打擊洗錢條例》下的牌照
const ratypeamlo = 101;

// 牌照類別
const roleType = ["corporation"]; // , "individual"

// 牌照/註冊狀況
const licstatus: any = ["active"]; //"all",

// 处理请求参数
const getBody = (data: any) => {
  const body = [];
  for (const key in data) {
    body.push(`${key}=${get(data, key, "")}`);
  }

  return body.join("&");
};

// 数据列表
let data_list: any[] = [];

async function getData(_data = {}) {
  const post_data = { ...config.data, ..._data };

  const page = get(post_data, "page", 1);

  console.log("🚀 ~ getData ~ page: start", page, Date.now());

  const resp = await API.fetch(config.api, {
    body: getBody(post_data),
    method: "POST",
    headers: config.headers,
  });
  if (!resp.err) {
    const pageSize = get(post_data, "limit");
    const start = get(post_data, "start", 0);
    const data = get(resp, "items", []);

    data_list = [...data_list, ...data];
    console.log(
      "🚀 ~ getData ~ page: end",
      page,
      Date.now(),
      "=",
      data.length,
      "=",
      pageSize
    );

    if (data.length === pageSize) {
      await getData({
        ..._data,
        start: start + pageSize,
        page: page + 1,
      });
    }
  }
  return {};
}

async function processData() {
  for (const _letter of nameStartLetterMap) {
    for (const _ratype of ratypeMap) {
      for (const _roleType of roleType) {
        for (const _licstatus of licstatus) {
          await getData({
            ratype: _ratype,
            roleType: _roleType,
            licstatus: _licstatus,
            nameStartLetter: _letter,
          });
          // await getData({
          //   ratype: _ratype,
          //   roleType: _roleType,
          //   licstatus: _licstatus,
          //   nameStartLetter: _letter,
          //   ratypeamlo,
          // });
        }
      }
    }
  }
}

// await processData();
data_list = uniqBy(data_list, "ceref");

let insert_row: any = [];
try {
  for (const item of data_list) {
    const start_time = Date.now();
    const no = item.ceref;
    const name = item.name;
    const nameChi = item.nameChi;

    const detail = await getDetail(no);
    const address = await getAddress(no);
    const ro = await getRoData(no);
    // const rep = await getRepData(no);
    const co = await getCofficerData(no);
    // const conditions = await getConditionsData(no);
    // const da = await getDaData(no);
    const licences = await getLicencesData(no);

    const supabase_row = {
      id: no,
      field_0600cb: name, // name
      field_90318a: nameChi, // nameChi
      field_6e31d4: get(address, "website.0.website", ""), // website
      field_6a0e6c: get(address, "email.0.email", ""), // email
      field_55a3d1: get(co, "0.email", ""), // co_email
      field_b61b6c: get(address, "address.0.fullAddress", ""), // address
      field_b1a32b: get(co, "0.address.fullAddress", ""), // co_address
      field_fadd47: get(ro, "0.fullName", ""), // ro
      field_ad8480: get(co, "0.fax", ""), // co_fax
      field_33698b: get(co, "0.tel", ""), // co_tel
      field_a3d34f: get(detail, "0.effDate", ""), // eff_date
      field_a1e60f: get(licences, "0.regulatedActivity.actDesc", ""), //licences
      field_546605: get(ro, "0.entityName", ""), // ro_entityName
      field_0d1d5f: get(licences, "0.regulatedActivity.actDesc", ""), // ro_licences
      description: "--",
      field_6f3cb8: get(detail, "0.effDate", ""), // ef_date
      updated_at: new Date(),
      raw: JSON.stringify(detail),
    };
    insert_row.push(supabase_row);
    console.log(no, "--duration--", Date.now() - start_time);
  }
} catch (error) {
  console.log("🚀 ~ error:", error);
}

writeFile(insert_row, "insert_row");

const resp = await insert(insert_row);
console.log("🚀 ~ resp:", resp);
