import axios, { type AxiosRequestConfig } from "axios";
import dayjs from "dayjs";
import _ from "lodash";

export interface WorkItem {
  name?: string; // 证监会编号 CE_NO
  description?: string; // 备注 - 描述
  field_90318a?: string; // 中文名称
  field_0600cb?: string; // 英文名称
  field_6e31d4?: string; // 公司网站
  field_6a0e6c?: string; // 公司电邮
  field_55a3d1?: string; // 投诉电邮
  field_b61b6c?: string; // 营业地址
  field_b1a32b?: string; // 投诉通讯地址
  field_fadd47?: string; // 其他资料-RO
  field_ad8480?: string; // 投诉传真
  field_a3d34f?: string; // 发牌日期 - 文本格式
  field_a1e60f?: string; // 有效的 SFC License
  field_546605?: string; // 其他资料 - 持牌人士
  field_33698b?: string; // 投诉电话
  field_0d1d5f?: string; // 其他资料 - 牌照
  field_6f3cb8?: Date; // 发牌日期 - 日期格式
  [k: string]: any;
}

export type FieldValuePairItem = {
  field_key: string;
  field_value: any;
};

export interface createWorkItemPayload {
  work_item_type_key: string; // 工作项类型
  template_id: string; // 模板 ID
  name: string; // 工作项名称
  field_value_pairs: FieldValuePairItem[]; // 工作项字段值对
}

export class FeiShuProject {
  private host: string;
  private user_key: string;
  private token: string;
  public template_id: string;
  public work_item_type_key: string;
  project_key: string;

  // https://project.feishu.cn/b/helpcenter/1p8d7djs/4bsmoql6
  static async fetchPluginToken() {
    const data = {
      plugin_id: process.env.PLUGIN_ID,
      plugin_secret: process.env.PLUGIN_SECRET,
      type: 0,
    };
    try {
      const res = await axios({
        method: "POST",
        url: "https://project.feishu.cn/open_api/authen/plugin_token",
        data,
      });
      const rawToken = res.data.data.token;
      return rawToken;
    } catch (e) {
      console.error("fetch plugin token error", JSON.stringify(e));
    }
  }

  constructor(token: string) {
    this.token = token!;
    this.project_key = process.env.PROJECT_KEY!;
    this.template_id = process.env.TEMPLATE_ID!;
    this.work_item_type_key = process.env.WORK_ITEM_TYPE_KEY!;
    this.host = "https://project.feishu.cn";
    this.user_key = process.env.USER_KEY!;
  }

  async request(method: string, path: string, data: any = {}) {
    try {
      const config: AxiosRequestConfig = {
        method,
        url: `${this.host}${path}`,
        headers: {
          "X-PLUGIN-TOKEN": this.token,
          "X-USER-KEY": this.user_key,
        },
        data,
      };
      return await axios(config);
    } catch (e: any) {
      console.error("--> makeRequest error", e.response?.data);
      return Promise.reject(e);
    }
  }

  total_work_items: WorkItem[] = [];
  current_page_num = 1;
  page_size = 200;
  // https://project.feishu.cn/b/helpcenter/1p8d7djs/1attl6vt
  public async workItemList(): Promise<any> {
    try {
      console.log("--> fetch work item list.");
      // fixed 429 error
      await new Promise((resolve) => setTimeout(resolve, 200));

      const result = await this.request(
        "POST",
        `/open_api/${this.project_key}/work_item/filter`,
        {
          work_item_type_keys: [this.work_item_type_key],
          page_size: this.page_size,
          page_num: this.current_page_num,
        }
      );
      const {
        pagination: { total },
        data = [],
      } = result.data || { pagination: {} };
      this.total_work_items.push(...data);

      if (data.length > 0) {
        this.current_page_num += 1;
        await this.workItemList();
      }
      let ids = this.total_work_items.reduce((acc, item) => {
        if (item.name) {
          acc[item.name] = item.id;
        }
        return acc;
      }, {});
      return ids;
    } catch (e: any) {
      console.error("--> fetchAllWorkItems error: ", e.message);
      return {};
    }
  }

  // 创建 SFC COMPANY 的工作项 https://project.feishu.cn/b/helpcenter/1p8d7djs/6c8et3fg
  public async createSfcWorkItem(body: createWorkItemPayload) {
    const path = `/open_api/${this.project_key}/work_item/create`;
    return await this.request("POST", path, body);
  }

  // 更新 SFC COMPANY 的工作项：https://project.feishu.cn/b/helpcenter/1p8d7djs/3e73r2k5
  public async updateSfcWorkItem(
    work_item_id: string,
    work_item_type_key: string,
    update_fields: FieldValuePairItem[]
  ) {
    return await this.request(
      "PUT",
      `/open_api/${this.project_key}/work_item/${work_item_type_key}/${work_item_id}`,
      { update_fields }
    );
  }
}
