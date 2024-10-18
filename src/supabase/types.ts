export interface SFCTableRowItem {
  id: string; // 证监会编号 CE_NO
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
  raw: any | null;
  created_at: string;
  updated_at: string | null;
  detail_prefix: string; // 详情页前缀 ri | corp
}
