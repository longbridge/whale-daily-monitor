import { main as feishuMain, main } from "../feishu/sfc_company";
import type { SFCCompanyHistoryTableRowItem } from "./types";
import { client } from "./connect";

async function getDiffIds(): Promise<[string[], string[]]> {
  const { data, error } = await client()
    .from("sfc_company_histories")
    .select("*")
    .eq("sync", 0)
    .order("created_at", { ascending: true });
  console.log("--> fetching diff ids", data?.length);

  if (error) {
    console.error("Error fetching previous count:", error);
    return [[], []];
  }
  const rows = data as unknown as SFCCompanyHistoryTableRowItem[];

  return [
    rows.map((item) => item.id.toString()),
    rows.flatMap((item) => item.ids.split(",")),
  ];
}

async function scheduled() {
  // get new ids
  const [ids, ids2] = await getDiffIds();
  if (ids2.length > 0) {
    try {
      await feishuMain(ids2);

      console.log("--> update sync status for ids", ids);
      await client()
        .from("sfc_company_histories")
        .update({ sync: 1 })
        .in("id", ids);
    } catch (error) {
      console.error("--> error syncing feishu", error);
    }
  } else {
    console.log("--> no new ids to sync");
  }
}

(async () => {
  await scheduled();
})();
