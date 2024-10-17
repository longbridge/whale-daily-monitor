import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { FeiShuProject, type createWorkItemPayload } from "./feishu";
import type { SFCTableRowItem } from "../supabase/types";
import dayjs from "dayjs";

const supabaseUrl = "https://ermcuynsclygxikpdhgh.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const items: SFCTableRowItem[] = [];
const batchSize = 10;
const maxRetries = 3;

// 用于记录错误的数组
const errorRecords: { id: string; error: string }[] = [];

// 获取 SFC Companies 数据
async function fetchSFCCompanies(offset: number, limit: number) {
  const { data, error } = await supabase
    .from("sfc_companies")
    .select("*")
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching SFC companies:", error);
    return [];
  }
  return data || [];
}

// 调用更新方法，并处理错误
async function updateSFCCompanyWorkItem(item: any) {
  // 此处是占位实现，请替换为实际的 API 调用
  // return await yourApiCall(item);

  // 模拟成功或失败的情况
  if (Math.random() < 0.8) {
    // 80% 成功
    return Promise.resolve();
  } else {
    return Promise.reject("Simulated error"); // 模拟错误
  }
}

// 记录错误到本地 CSV 文件
function logErrorsToCSV(errors: any[]) {
  const timestamp = new Date()
    .toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })
    .replace(/[:\s]/g, "")
    .replace(/\//g, "");
  const filename = path.join(
    __dirname,
    `${timestamp}_update_feishu_work_item_error.log`
  );

  const csvContent =
    "ID,请求的 URL,错误原因\n" +
    errors.map((err) => `${err.id},"${err.url}","${err.error}"`).join("\n");
  fs.writeFileSync(filename, csvContent);
}

function normalizeWorkItemPayload(
  item: SFCTableRowItem,
  template_id: string,
  work_item_type_key: string
): createWorkItemPayload {
  // 描述字段用富文档结构处理 https://project.feishu.cn/b/helpcenter/1p8d7djs/1tj6ggll#8b62937b
  const url = `https://apps.sfc.hk/publicregWeb/corp/${item.id}/details`;
  const description = [
    {
      type: "paragraph",
      content: [
        {
          type: "hyperlink",
          attrs: {
            title: url,
            url,
          },
        },
      ],
    },
  ];

  return {
    work_item_type_key,
    template_id,
    name: item.id, // // sfc 中的 id 为 name 字段
    field_value_pairs: [
      { field_key: "field_90318a", field_value: item.field_90318a }, // 中文名称
      { field_key: "field_0600cb", field_value: item.field_0600cb }, // 英文名称
      { field_key: "field_6e31d4", field_value: item.field_6e31d4 }, // 公司网站
      { field_key: "field_6a0e6c", field_value: item.field_6a0e6c }, // 公司电邮
      { field_key: "field_55a3d1", field_value: item.field_55a3d1 }, // 投诉电邮
      { field_key: "field_b61b6c", field_value: item.field_b61b6c }, // 营业地址
      { field_key: "field_b1a32b", field_value: item.field_b1a32b }, // 投诉通讯地址
      { field_key: "field_fadd47", field_value: item.field_fadd47 }, // 其他资料-RO
      { field_key: "field_ad8480", field_value: item.field_ad8480 }, // 投诉传真
      { field_key: "field_a3d34f", field_value: item.field_a3d34f }, // 发牌日期 - 文本格式
      { field_key: "field_a1e60f", field_value: item.field_a1e60f }, // 有效的 SFC License
      { field_key: "field_546605", field_value: item.field_546605 }, // 其他资料 - 持牌人士
      { field_key: "field_33698b", field_value: item.field_33698b }, // 投诉电话
      { field_key: "field_0d1d5f", field_value: item.field_0d1d5f }, // 其他资料 - 牌照
      {
        field_key: "field_6f3cb8",
        field_value: dayjs(item.field_6f3cb8).valueOf(),
      }, // 发牌日期 - 日期格式
      { field_key: "description", field_value: description }, // 备注 - 描述
    ],
  };
}
// 主程序
export async function main() {
  // create feishu project instance
  const token = await FeiShuProject.fetchPluginToken();

  const feishuProject = new FeiShuProject(token);

  let offset = 0;
  let totalItemsFetched = 0;

  while (true) {
    const companies = await fetchSFCCompanies(offset, 2);
    if (companies.length === 0) break;

    items.push(...companies);
    totalItemsFetched += companies.length;
    offset += 2;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const promises = batch.map((item) => {
        let workitemPayload = normalizeWorkItemPayload(
          item,
          feishuProject.template_id,
          feishuProject.work_item_type_key
        );
        // console.log("-----------", workitemPayload);
        return feishuProject.createSfcWorkItem(workitemPayload).catch((err) => {
          const retryPromise = async (retries: number) => {
            if (retries > 0) {
              try {
                await feishuProject.createSfcWorkItem(workitemPayload);
              } catch (retryErr) {
                return retryPromise(retries - 1);
              }
            }
            throw new Error(err);
          };
          return retryPromise(maxRetries).catch((retryErr) => {
            errorRecords.push({ id: item.id, error: retryErr.message });
          });
        });
      });

      Promise.all(promises).then(() => {
        console.log("--> ");
      });
    }
  }

  // 记录所有错误到 CSV
  if (errorRecords.length > 0) {
    logErrorsToCSV(errorRecords);
  }

  console.log(`Total items fetched: ${totalItemsFetched}`);
}
