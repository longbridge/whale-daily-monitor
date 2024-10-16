import axios from 'axios'; 
import dayjs from 'dayjs'; 
import FormData from 'form-data'; 

class FeiShuProject {
    private host: string;
    private project_key: string;
    private user_key: string;
    private headers: { [key: string]: string };
    private token: string;

    constructor(host = "https://project.feishu.cn", project_key = "64813fde445795f388542438", user_key = "user_key") {
        this.host = host;
        this.project_key = project_key;
        this.user_key = user_key;
        this.headers = {
            "Content-Type": "application/json",
            "X-USER-KEY": this.user_key,
        };
        this.getPluginToken().then(token => {
            this.token = token;
        });
    }

    private async makeRequest(method: string, path: string, data?: any) {
        /** 统一处理请求 */
        const url = this.host + path;
        const response = await axios({
            method,
            url,
            headers: this.headers,
            data,
        });
        return response.data;
    }

    private async getPluginToken(): Promise<string> {
        /** 获取 plugin token */
        const path = "/open_api/authen/plugin_token";
        const body = {
            "plugin_id": "MII_670FDB653A82001C",
            "plugin_secret": "",
            "type": 0,
        };
        const tokenData = await this.makeRequest("POST", path, body);
        const token = tokenData.data.token;
        this.headers["X-PLUGIN-TOKEN"] = token;
        return token;
    }

    public async listProject() {
        /** 获取空间列表，返回 project_key */
        const path = "/open_api/projects";
        const body = { user_key: this.user_key };
        return this.makeRequest("POST", path, body);
    }

    public async projectDetail() {
        /** 获取空间详情 */
        const path = "/open_api/projects/detail";
        const body = {
            user_key: this.user_key,
            project_keys: [
                // "64813fde445795f388542438",
                "650069aeb1232854aca226f4",
                // "647f2548c65b3cb5e4409f08"
            ],
        };
        return this.makeRequest("POST", path, body);
    }

    public async projectFieldAll() {
        /** 指定空间或工作项类型（推荐）下所有“字段”的基础信息 */
        const path = `/open_api/${this.project_key}/field/all`;
        const body = { work_item_type_key: "story" };
        const result = await this.makeRequest("POST", path, body);
        console.log(result); // 使用 console.log 替代 logger.info
        return result;
    }

    public async getWorkItem(project_key?: string) {
        /** 获取工作项及对应的类型 */
        const path = `/open_api/${project_key}/work_item/all-types`;
        const result = await this.makeRequest("GET", path);
        console.log(result); // 使用 console.log 替代 logger.info
        return result;
    }

    public async workItemDetail() {
        /** 获取工作项详情 */
        const path = `/open_api/${this.project_key}/work_item/story/query`;
        const work_item_id = '4425891457';
        const body = {
            // "work_item_name": "反馈管理",
            work_item_ids: [work_item_id],
        };
        const result = await this.makeRequest("POST", path, body);
        console.log(result); // 使用 console.log 替代 logger.info
        return result;
    }

    public async workItemList(project_key?: string) {
        /** 获取工作项列表 */
        const path = `/open_api/${project_key}/work_item/filter`;
        const body = {
            work_item_type_keys: [
                "6706259063b9f34780f1fbe5"
            ],
            page_size: 50,
        };
        const result = await this.makeRequest("POST", path, body);
        console.log(result); // 使用 console.log 替代 logger.info
        return result;
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

    public createSfcWorkItemValues(sfc_num: string, lice_date: string, lice_valid: string, cn_name: string, en_name: string, address: string, lice_info: string, remark: string): object {
        /**
         * name: 证监会编号 CE_NO
         * 生成工作项的 field_value_pairs
         */
        const field_value_pairs = this.genSfcItemData(lice_date, lice_valid, cn_name, en_name, address, lice_info, remark);

        const body = {
            work_item_type_key: "6706259063b9f34780f1fbe5",
            template_id: 1921387,
            name: sfc_num,
            field_value_pairs: field_value_pairs,
        };

        return body;
    }

    private genSfcItemData(lice_date: string, lice_valid: string, cn_name: string, en_name: string, address: string, lice_info: string, remark: string): Array<{ field_key: string, field_value: any }> {
        /**
         * 生成 SFC 工单的数据列表
         */
        const tranTime = (t: string): number | null => {
            const date_format = "DD MMM YYYY";
            if (t !== '') {
                const date_obj = dayjs(t, date_format);
                return date_obj.valueOf(); // 转换为时间戳
            }
            return null;
        };

        const field_value_pairs = [];
        field_value_pairs.push(
            {
                field_key: "field_6f3cb8",  // 发牌日期 - 日期格式 data 格式 1722182400000  00:00:00
                field_value: tranTime(lice_date),
            },
            {
                field_key: "field_a3d34f",  // 发牌日期 - 文本格式 text 格式
                field_value: lice_date,
            },
            {
                field_key: "field_a1e60f",  // 有效的 SFC License text 格式
                field_value: lice_valid,
            },
            {
                field_key: "field_90318a",  // 中文名称 text 格式
                field_value: cn_name,
            },
            {
                field_key: "field_0600cb",  // 英文名称 text 格式
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
                field_key: "field_b61b6c",  // 营业地址 text 格式
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
                field_key: "field_0d1d5f",  // 其他资料 - 牌照 text 格式
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
                field_key: "description",  // 备注 - 描述 multi text 格式
                // field_value: remark,
                field_value: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: remark,
                                attrs: {
                                    fontColor: "blue",
                                    italic: true,
                                    underline: true,
                                },
                            },
                        ],
                    },
                ],
            },
        );
        return field_value_pairs;
    }

    public async createSfcWorkItem(body: object) {
        /** 创建 SFC COMPANY 的工作项 */
        const path = `/open_api/${this.project_key}/work_item/create`;
        const result = await this.makeRequest("POST", path, body);
        console.log(result); // 使用 console.log 替代 logger.debug
        const project_id = result.data;
        const work_item_url = `https://project.feishu.cn/whale_bd/sfc_company/detail/${project_id}`;
        console.log(work_item_url); // 使用 console.log 替代 logger.info
        return work_item_url;
    }

    public async updateSfcWorkItem(work_item_id: string, work_item_type_key: string = "6706259063b9f34780f1fbe5", body: object) {
        /**
         * 更新 SFC COMPANY 的工作项
         */
        const path = `/open_api/${this.project_key}/work_item/${work_item_type_key}/${work_item_id}`;
        body = { update_fields: body };
        const result = await this.makeRequest("PUT", path, body);
        console.log(`${result}, ${work_item_id}, ${body}`); // 使用 console.log 替代 logger.debug
        const project_id = result.data;
        const work_item_url = `https://project.feishu.cn/whale_bd/sfc_company/detail/${project_id}`;
        console.log(work_item_url); // 使用 console.log 替代 logger.info
        return work_item_url;
    }

    public async listSfcWorkItem() {
        const path = `/open_api/${this.project_key}/work_item/filter`;
        const params = {
            work_item_type_keys: [
                "6706259063b9f34780f1fbe5",
            ],
        };
        const result = await this.makeRequest("POST", path, params);
        return result;
    }

    public async addAttachment(om_id?: string, img_key?: string, work_item_id: number = 4947882387, work_item_type_key: string = "story", media_key?: string) {
        /** 添加附件 */
        const path = `/open_api/${this.project_key}/work_item/${work_item_type_key}/${work_item_id}/file/upload`;

        // 通过 get_file 接口获取到 img 的 binary 值
        const file_key = img_key || media_key;
        const file_data = await this.getFile(om_id, file_key); // 假设您有一个获取文件的方法
        const fileByte = Buffer.from(file_data); // 将文件数据转换为 Buffer
        const formData = new FormData();
        
        if (media_key) {
            formData.append('file', new Blob([fileByte]), `${Date.now()}.mp4`);
        } else {
            formData.append('file', new Blob([fileByte]), `${Date.now()}.png`);
        }
        formData.append('field_key', 'field_97239a');

        const response = await axios.post(path, formData, {
            headers: {
                ...this.headers,
                ...formData.getHeaders(),
            },
        });
        return response.data;
    }

    // 示例获取文件的方法
    private async getFile(om_id: string, file_key: string) {
        // 这里实现文件获取逻辑
        return new Uint8Array(); // 返回文件的二进制数据
    }
}

// 使用示例
(async () => {
    const fsp = new FeiShuProject('');
    await fsp.listSfcWorkItem();
})();