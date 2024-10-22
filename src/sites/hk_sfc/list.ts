import { get, isEqual, last } from "lodash-es";
import { API } from "../../api";
import config from "../../config/hk_sfc";
import { select, select_by_params } from "../../supabase/connect";
import { readJsonFile } from "../../fs";
import dayjs from "dayjs";
import type { PARTIAL } from "./entry";

// 名称开头
const nameStartLetterMap = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
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
// @ts-ignore
let data_list: any = [];

/**
 * 获取数据 list
 * @param _data
 * @returns
 */
async function getData(_data = {}) {
  const post_data = { ...config.data, ..._data };

  const page = get(post_data, "page", 1);

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

/**
 * 获取数据 list「根据各种条件」
 */
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

export const getList = async () => {
  await processData();
  return data_list;
};

export const getPreviousListCount = async () => {
  const total_counts_from_supabase = await select(
    "total_count",
    "sfc_company_meta"
  );
  const previous_total_counts = get(
    last(total_counts_from_supabase),
    "total_count"
  );
  return previous_total_counts;
};

export const getDiffList = async (new_list: any[]) => {
  const total_counts_from_supabase = await select("ids", "sfc_company_meta");
  const previous_list_ids = get(
    last(total_counts_from_supabase),
    "ids",
    ""
  )?.split(",");

  const diff_list = new_list.filter(
    (item: any) => !previous_list_ids.includes(item.ceref)
  );

  return diff_list;
};

export const parse_detail_info = async (data_list: any[]) => {
  const feishu_rows = [];
  const supabase_rows = [];

  for (const item of data_list) {
    const address = await readJsonFile(
      `src/backup/hk_sfc/address/${item.ceref}.json`,
      {}
    );
    const detail = await readJsonFile(
      `src/backup/hk_sfc/detail/${item.ceref}.json`,
      {}
    );
    const co = await readJsonFile(
      `src/backup/hk_sfc/co/${item.ceref}.json`,
      {}
    );
    const conditions = await readJsonFile(
      `src/backup/hk_sfc/conditions/${item.ceref}.json`,
      {}
    );
    const da = await readJsonFile(
      `src/backup/hk_sfc/da/${item.ceref}.json`,
      {}
    );
    const licences = await readJsonFile(
      `src/backup/hk_sfc/licences/${item.ceref}.json`,
      {}
    );
    const rep = await readJsonFile(
      `src/backup/hk_sfc/rep/${item.ceref}.json`,
      {}
    );
    const ro = await readJsonFile(
      `src/backup/hk_sfc/ro/${item.ceref}.json`,
      {}
    );

    const path = get(item, "isCorp") ? "corp" : get(item, "isRi") ? "ri" : "eo";
    const feishu_row = {
      "证监会编号CE_NO(name)": item.ceref,
      "SFC INFO类型(template)": "默认 SFC INFO 类型",
      "优先级(priority)": "P1",
      "创建者(owner)": "bo.li@longbridge-inc.com",
      "关注人(watchers)": "shawn.men@longbridge.cloud",
      "备注-描述(description)": `https://apps.sfc.hk/publicregWeb/${path}/${item.ceref}/details`,
      "业务线(business)": "默认业务线",
      "自增数字(auto_number)": "",
      "英文名称(field_0600cb)": item.name, // name
      "中文名称(field_90318a)": item.nameChi, // nameChi
      "营业地址(field_b61b6c)": get(address, "address.0.fullAddress", ""), // address
      "有效的SFC License(field_a1e60f)":
        get(item, "hasActiveLicence", "N") === "Y" ? "有" : "没有", //licences
      "发牌日期-文本格式(field_a3d34f)": dayjs(
        get(detail, "list.0.effDate", "")
      ).format("YYYY-MM-DD"), // eff_date
      "发牌日期-日期格式(field_6f3cb8)": dayjs(
        get(detail, "list.0.effDate", "")
      ).format("YYYY-MM-DD"), // ef_date
      "其他资料-牌照(field_0d1d5f)": get(licences, "list", [])
        .map(
          (l: any) =>
            `「${get(l, "regulatedActivity.cactDesc")}: ${[
              get(l, "effectivePeriodList.0.effectiveDate"),
              get(l, "effectivePeriodList.0.endDate", ""),
            ].join("-")}」`
        )
        .join("#-#"), // ro_licences
      "公司网站(field_6e31d4)": get(address, "website.0.website", ""), // website
      "公司电邮(field_6a0e6c)": get(address, "email.0.email", ""), // email
      "其他资料-持牌人士(field_546605)": get(rep, "list", [])
        .map((r: any) => get(r, "ceRef", ""))
        .filter(Boolean)
        .join(","), // ro_entityName
      "其他资料-RO(field_fadd47)": get(ro, "list.0.fullName", ""), // ro
      "投诉电话(field_33698b)": get(co, "list.0.tel", ""), // co_tel
      "投诉传真(field_ad8480)": get(co, "list.0.fax", ""), // co_fax
      "投诉电邮(field_55a3d1)": get(co, "list.0.email", ""), // co_email
      "投诉通讯地址(field_b1a32b)": get(co, "list.0.address.fullAddress", ""), // co_address
      "拉群方式选择(group_type)": "不拉群",
      "当前状态(work_item_status)": "未开始",
      "当前状态开始时间(status_begin_time)": dayjs().format("YYYY-MM-DD"),
    };
    const supabase_row = {
      id: item.ceref,
      description: `https://apps.sfc.hk/publicregWeb/${path}/${item.ceref}/details`,
      field_0600cb: item.name, // name
      field_90318a: filter_u0000(item.nameChi), // nameChi
      field_b61b6c: get(address, "address.0.fullAddress", ""), // address
      field_a1e60f: get(item, "hasActiveLicence", "N") === "Y" ? "有" : "没有", //licences
      field_a3d34f: get(detail, "list.0.effDate", ""), // eff_date
      field_6f3cb8: get(detail, "list.0.effDate", ""), // ef_date
      field_0d1d5f: get(licences, "list", [])
        .map(
          (l: any) =>
            `「${get(l, "regulatedActivity.cactDesc")}: ${[
              get(l, "effectivePeriodList.0.effectiveDate"),
              get(l, "effectivePeriodList.0.endDate", ""),
            ].join("-")}」`
        )
        .join("#-#"), // ro_licences
      field_6e31d4: get(address, "website.0.website", ""), // website
      field_6a0e6c: get(address, "email.0.email", ""), // email
      field_546605: get(rep, "list", [])
        .map((r: any) => get(r, "ceRef", ""))
        .filter(Boolean)
        .join(","), // ro_entityName
      field_fadd47: filter_u0000(get(ro, "list.0.fullName", "")), // ro
      field_33698b: filter_u0000(get(co, "list.0.tel", "")), // co_tel
      field_ad8480: filter_u0000(get(co, "list.0.fax", "")), // co_fax
      field_55a3d1: filter_u0000(get(co, "list.0.email", "")), // co_email
      field_b1a32b: filter_u0000(get(co, "list.0.address.fullAddress", "")), // co_address
      updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      raw: "{}",
      detail_prefix: path,
    };
    feishu_rows.push(feishu_row);
    supabase_rows.push(supabase_row);
  }
  return { feishu_rows, supabase_rows };
};

function filter_u0000(str: string) {
  return str ? str.replace(/\u0000/g, "") : "";
}

export const get_partial_list = async (partial_ids: string) => {
  let data_list: any[] = [];
  for (const item of partial_ids.split(",")) {
    const body = getBody({
      licstatus: "all",
      lictype: "all",
      searchbyoption: "byceref",
      searchtext: item,
      page: 1,
      start: 0,
      limit: 20,
      sort: '[{"property":"ceref","direction":"ASC"}]',
    });
    const resp = await API.fetch(config.api_by_name, {
      body,
      method: "POST",
      headers: config.headers,
    });
    if (!resp.err) {
      const data = get(resp, "items", []);
      data_list = [...data_list, ...data];
    }
  }
  return data_list;
};

export const compare_supabase_data = async (data_list: any[]) => {
  const diff_list = [];
  for (const item of data_list) {
    const supabase_row =
      (await select_by_params("id", item.id, "*", "sfc_companies")) || [];

    if (supabase_row.length > 0) {
      const new_row = { ...item };
      const old_row = supabase_row[0] || {};

      delete new_row.updated_at;
      delete new_row.created_at;
      // @ts-ignore
      delete old_row.updated_at;
      // @ts-ignore
      delete old_row.created_at;

      if (!isEqual(new_row, old_row)) {
        diff_list.push(item);
      }
    } else {
      diff_list.push(item);
    }
  }

  return diff_list;
};
