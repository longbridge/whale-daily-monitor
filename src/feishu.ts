import axios from "axios";
import dayjs from "dayjs";

class FeiShuProject {
  private host: string;
  private user_key: string;
  private token: String;
  project_key: String;

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

  constructor(token: String, project_key: String) {
    this.token = token;
    this.project_key = project_key;
    this.host = "https://project.feishu.cn";
    this.user_key = process.env.USER_KEY!;
  }

  private async makeRequest(method: string, path: string, data?: any = {}) {
    const headers = {
      "X-PLUGIN-TOKEN": this.token,
      "X-USER-KEY": this.user_key,
    };
    console.log("--> makeRequest", method, path, data, headers);
    try {
      return await axios({
        method,
        url: `${this.host}${path}`,
        headers,
        data,
      });
    } catch (e) {
      console.error("--> makeRequest error", e);
      return Promise.reject(e);
    }
  }

  // https://project.feishu.cn/b/helpcenter/1p8d7djs/568y2esm
  public async projects() {
    /** 获取空间列表，返回 project_key */
    const path = "/open_api/projects";
    const body = { user_key: this.user_key };
    const res = await this.makeRequest("POST", path, body);
    return res.data.data;
  }

  // https://project.feishu.cn/b/helpcenter/1p8d7djs/2cicquna
  public async projectDetail(project_keys: string[]) {
    /** 获取空间详情 */
    const path = "/open_api/projects/detail";
    const body = {
      user_key: this.user_key,
      simple_name: ["whale_bd"],
      project_keys,
    };
    const res = await this.makeRequest("POST", path, body);
    return res.data.data;
  }

  public async projectFieldAll() {
    /** 指定空间或工作项类型（推荐）下所有“字段”的基础信息 */
    const path = `/open_api/${this.project_key}/field/all`;
    const body = { work_item_type_key: "story" };
    const result = await this.makeRequest("POST", path, body);
    console.log(result); // 使用 console.log 替代 logger.info
    return result;
  }

  public async getWorkItem() {
    /** 获取工作项及对应的类型 */
    const path = `/open_api/${this.project_key}/work_item/all-types`;
    const result = await this.makeRequest("GET", path);
    return result.data.data;
  }

  public async workItemDetail() {
    /** 获取工作项详情 */
    const path = `/open_api/${this.project_key}/work_item/story/query`;
    const work_item_id = "4425891457";
    const body = {
      // "work_item_name": "反馈管理",
      work_item_ids: [work_item_id],
    };
    const result = await this.makeRequest("POST", path, body);
    console.log(result); // 使用 console.log 替代 logger.info
    return result;
  }

  public async workItemList(work_item_type_keys: string) {
    /** 获取工作项列表 */
    const path = `/open_api/${this.project_key}/work_item/filter`;
    const body = {
      work_item_type_keys: [work_item_type_keys],
      page_size: 200,
    };
    const result = await this.makeRequest("POST", path, body);
    return result.data.data;
  }

  public async getWorkItemMeta(project_key?: string, item: string = "story") {
    /** 获取创建工作项元数据 */
    const path = `/open_api/${project_key}/work_item/${item}/meta`;
    const result = await this.makeRequest("GET", path);
    console.log(result); // 使用 console.log 替代 logger.info
    return result;
  }

  public async getTemplates(work_item_type_key?: string) {
    /** 获取工作项下的流程模板列表 */
    const path = `/open_api/${this.project_key}/template_list/${work_item_type_key}`;
    const result = await this.makeRequest("GET", path);
    console.log(result); // 使用 console.log 替代 logger.info
    return result;
  }

  public createSfcWorkItemValues(
    work_item_type_key: string,
    template_id: string,
    sfc_num: string,
    lice_date: string,
    lice_valid: string,
    cn_name: string,
    en_name: string,
    address: string,
    lice_info: string,
    remark: string
  ): object {
    /**
     * name: 证监会编号 CE_NO
     * 生成工作项的 field_value_pairs
     */
    const field_value_pairs = this.genSfcItemData(
      lice_date,
      lice_valid,
      cn_name,
      en_name,
      address,
      lice_info,
      remark
    );

    const body = {
      work_item_type_key,
      template_id,
      name: sfc_num,
      field_value_pairs,
    };

    return body;
  }

  private genSfcItemData(
    lice_date: string,
    lice_valid: string,
    cn_name: string,
    en_name: string,
    address: string,
    lice_info: string,
    remark: string
  ): Array<{ field_key: string; field_value: any }> {
    /**
     * 生成 SFC 工单的数据列表
     */
    const tranTime = (t: string): number | null => {
      const date_format = "DD MMM YYYY";
      if (t !== "") {
        const date_obj = dayjs(t, date_format);
        return date_obj.valueOf(); // 转换为时间戳
      }
      return null;
    };

    const field_value_pairs = [];
    field_value_pairs.push(
      {
        field_key: "field_6f3cb8", // 发牌日期 - 日期格式 data 格式 1722182400000  00:00:00
        field_value: tranTime(lice_date),
      },
      {
        field_key: "field_a3d34f", // 发牌日期 - 文本格式 text 格式
        field_value: lice_date,
      },
      {
        field_key: "field_a1e60f", // 有效的 SFC License text 格式
        field_value: lice_valid,
      },
      {
        field_key: "field_90318a", // 中文名称 text 格式
        field_value: cn_name,
      },
      {
        field_key: "field_0600cb", // 英文名称 text 格式
        field_value: en_name,
      },
      // {
      //     field_key: "field_6e31d4",  // 公司网站 text 格式
      //     field_value: site,
      // },
      // {
      //     field_key: "field_6a0e6c",  // 公司电邮 text 格式
      //     field_value: email,
      // },
      {
        field_key: "field_b61b6c", // 营业地址 text 格式
        field_value: address,
      },
      // {
      //     field_key: "field_33698b",  // 投诉电话 text 格式
      //     field_value: complain_phone,
      // },
      // {
      //     field_key: "field_b1a32b",  // 投诉通讯地址 text 格式
      //     field_value: complain_address,
      // },
      // {
      //     field_key: "field_ad8480",  // 投诉传真 text 格式
      //     field_value: complain_fax,
      // },
      // {
      //     field_key: "field_55a3d1",  // 投诉电邮 text 格式
      //     field_value: complain_email,
      // },
      {
        field_key: "field_0d1d5f", // 其他资料 - 牌照 text 格式
        field_value: lice_info,
      },
      // {
      //     field_key: "field_fadd47",  // 其他资料-RO text 格式
      //     field_value: ro_info,
      // },
      // {
      //     field_key: "field_546605",  // 其他资料 - 持牌人士 text 格式
      //     field_value: licensee,
      // },
      {
        field_key: "description", // 备注 - 描述 multi text 格式
        field_value: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: remark,
                attrs: {
                  fontColor: "blue",
                  italic: "true",
                  underline: "true",
                },
              },
            ],
          },
        ],
      }
    );
    return field_value_pairs;
  }

  public async createSfcWorkItem(body: object) {
    /** 创建 SFC COMPANY 的工作项 */
    const path = `/open_api/${this.project_key}/work_item/create`;
    const result = await this.makeRequest("POST", path, body);
    return result.data;
  }

  // 更新 SFC COMPANY 的工作项：https://project.feishu.cn/b/helpcenter/1p8d7djs/3e73r2k5
  public async updateSfcWorkItem(
    work_item_id: string,
    work_item_type_key: string,
    update_fields: any
  ) {
    const path = `/open_api/${this.project_key}/work_item/${work_item_type_key}/${work_item_id}`;
    const result = await this.makeRequest("PUT", path, { update_fields });
    return result.data;
  }
}

// 使用示例
(async () => {
  let token = await FeiShuProject.fetchPluginToken();
  //   let project_keys = await feishuProject.projects();
  //   const project_key = project_keys[0];
  const project_key = process.env.PROJECT_KEY!;

  //   console.log("token: ", token);
  let feishuProject = new FeiShuProject(token, project_key);

  //   let projectDetail = await feishuProject.projectDetail(project_keys);

  //   let get_work_item = await feishuProject.getWorkItem(project_key);

  const work_item_type_key = process.env.WORK_ITEM_TYPE_KEY!;
  //   const items = await feishuProject.workItemList(work_item_type_key);

  const workItemParams = feishuProject.createSfcWorkItemValues(
    work_item_type_key,
    "1921387",
    "1234567890",
    "01 Jan 2024",
    "01 Jan 2025",
    "Test Company",
    "Test Company",
    "Test Address",
    "Test License Info",
    "Test Remark"
  );

  console.log(workItemParams);

  //   const res = await feishuProject.createSfcWorkItem(workItemParams);

  //   let workItemID = res.data;
  let workItemID = process.env.WORK_ITEM_ID!;

  const update_fields = [
    {
      field_key: "name", // 字段 key，作为请求参数和 field_alias 二选一必填
      field_value: "update_123_sie", // 字段值，作为请求参数必填
    },
  ];

  const res2 = await feishuProject.updateSfcWorkItem(
    workItemID,
    work_item_type_key,
    update_fields
  );

  console.log("---> workItemID: ", workItemID);
  console.log("---> res2: ", res2);
})();
