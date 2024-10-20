import { insert, upsert } from "../../supabase/connect";
import { processInBatches } from "./fetch_detail";
import { insertDataToExcel } from "./feishu_excel";
import {
  getList,
  getPreviousListCount,
  getDiffList,
  parse_detail_info,
  get_partial_list,
} from "./list";

export interface PARTIAL {
  ceref: string;
  isCorp: boolean;
  isRi: boolean;
  isEo: boolean;
}

export class HK_SFC {
  private data_list: any[] = [];

  public async check_list() {
    // 检查接口列表
    this.data_list = await getList();
    const previous_total_counts = await getPreviousListCount();

    if (previous_total_counts !== this.data_list.length) {
      // 前后两次数量不一致就记录
      const diff_list = await getDiffList(this.data_list);

      this.insert_meta(this.data_list);
      this.insert_history(diff_list);

      // 增量更新
      this.get_full_detail_from_file(diff_list);
    }
  }

  /**
   * 获取详情
   * @param data_list
   * @param batch_size
   * 生成完后会记录到 backup/hk_sfc/xxx 目录下
   */
  public async get_detail_from_page(data_list: any[], batch_size = 3) {
    await processInBatches(data_list, batch_size);
  }

  public async get_full_detail_from_file(
    data_list = this.data_list,
    incremental = false
  ) {
    // 从 supabase 中获取数据
    const { feishu_rows, supabase_rows } = await parse_detail_info(data_list);

    this.insertDataToExcel(feishu_rows);

    if (incremental) {
      this.insert_incremental_detail(supabase_rows);
    } else {
      this.insert_full_detail(supabase_rows);
    }
  }

  public async update_by_partial(partial: PARTIAL[]) {
    const partial_list = await get_partial_list(partial);
    await processInBatches(partial_list, 3);

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
          ids: data_list.map((item: any) => item.ceref).join(","),
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
          ids: diff_list.map((item: any) => item.ceref).join(","),
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
