import { insert, upsert } from "../../supabase/connect";
import { processInBatches } from "./fetch_detail";
import { insertDataToExcel } from "./feishu_excel";
import { main as feishuMain } from "../../feishu/sfc_company";
import {
  getList,
  getPreviousListCount,
  getDiffList,
  parse_detail_info,
  get_partial_list,
  compare_supabase_data,
} from "./list";

export interface PARTIAL {
  ceref: string;
  isCorp?: boolean;
  isRi?: boolean;
  isEo?: boolean;
}

export class HK_SFC {
  private data_list: any[] = [];

  public async check_list() {
    // 检查接口列表
    const start_time = new Date();
    this.data_list = await getList();
    const end_time = new Date();
    console.log(
      "🚀 ~ HK_SFC ~ check_list ~ duration:",
      end_time.getTime() - start_time.getTime()
    );
    const previous_total_counts = await getPreviousListCount();

    if (previous_total_counts !== this.data_list.length) {
      // 前后两次数量不一致就记录
      const diff_list = await getDiffList(this.data_list);
      if (diff_list.length > 0) {
        await this.insert_meta(diff_list);
        await this.insert_history(diff_list);

        // 增量更新
        await this.get_full_detail_from_file(diff_list);
      }
    }
  }

  /**
   * 获取详情
   * @param data_list
   * @param batch_size
   * 生成完后会记录到 backup/hk_sfc/xxx 目录下
   */
  public async get_detail_from_page(data_list: any[], batch_size = 3) {
    const start_time = new Date();
    await processInBatches(data_list, batch_size);
    const end_time = new Date();
    console.log(
      "🚀 ~ HK_SFC ~ get_detail_from_page ~ duration: ",
      end_time.getTime() - start_time.getTime(),
      " list_length:",
      data_list.length
    );
  }

  public async get_full_detail_from_file(
    data_list = this.data_list,
    incremental = false
  ) {
    // 从 supabase 中获取数据
    const { feishu_rows, supabase_rows } = await parse_detail_info(data_list);

    /**
     * 对比 supabase 的数据，如果数据有变化，则更新 meta 和 history table
     */
    // this.insertDataToExcel(feishu_rows);

    if (incremental) {
      const diff_list = await compare_supabase_data(supabase_rows);
      if (diff_list.length > 0) {
        await this.insert_incremental_detail(diff_list);
        // await this.insert_meta(diff_list);
        await this.insert_history(diff_list);
      }
    } else {
      await this.insert_full_detail(supabase_rows);
    }

    // 通知同步飞书
    const ids = data_list.map((item) => item.ceref);
    if (ids.length > 0) {
      try {
        await feishuMain(ids);
      } catch (error) {
        console.error("--> error syncing feishu", error);
      }
    }
  }

  public async update_by_partial(partial_ids: string) {
    const partial_list = await get_partial_list(partial_ids);

    await this.get_detail_from_page(partial_list, 3);

    await this.get_full_detail_from_file(partial_list, true);
  }

  /**
   * 全量插入
   * @param supabase_rows
   */
  public async insert_full_detail(supabase_rows: any[]) {
    insert(supabase_rows);
  }

  /**
   * 增量插入
   * @param supabase_rows
   */
  public async insert_incremental_detail(supabase_rows: any[]) {
    supabase_rows.forEach((item) => {
      upsert(item);
    });
  }

  // 生成飞书模版 excel 数据，方便导入
  public async insertDataToExcel(feishu_rows: any[]) {
    insertDataToExcel("src/sites/hk_sfc/company.xlsx", feishu_rows);
  }

  // 记录元数据
  public async insert_meta(data_list: any[]) {
    insert(
      [
        {
          created_at: new Date(),
          total_count: data_list.length,
          ids: data_list.map((item: any) => item.ceref || item.id).join(","),
        },
      ],
      "sfc_company_meta"
    );
  }

  public async insert_history(diff_list: any[]) {
    insert(
      [
        {
          created_at: new Date(),
          sync: 0,
          ids: diff_list.map((item: any) => item.ceref || item.id).join(","),
        },
      ],
      "sfc_company_histories"
    );
  }
}

const hk_sfc = new HK_SFC();
// 检测列表更新情况，有变化自动更新
// hk_sfc.check_list();

// 更新部分数据
// hk_sfc.update_by_partial([
//   { ceref: "BUU725", isCorp: true, isRi: false, isEo: false },
// ]);
