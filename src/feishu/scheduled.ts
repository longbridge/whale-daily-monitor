import { main as feishuMain, main } from "./sfc_company";
import type { SFCCompanyHistoryTableRowItem } from "../supabase/types";
import { loginUser, supabase } from "../supabase/connect";

async function getDiffIds(): Promise<[string[], string[]]> {
  await loginUser();

  const { data, error } = await supabase
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

export async function feishuScheduled() {
  // get new ids
  const [ids, ids2] = await getDiffIds();
  if (ids2.length > 0) {
    try {
      await feishuMain(ids2);

      console.log("--> update sync status for ids", ids2);
      await supabase
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

// (async () => {
//   await scheduled();
// })();
