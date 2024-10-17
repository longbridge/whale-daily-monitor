import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://ermcuynsclygxikpdhgh.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "";

export const upsert = async (params: any) => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from("sfc_companies").upsert(params);
  console.log("🚀 ~ upsert ~ data, error:", data, error);
};

export const insert = async (params: any) => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from("sfc_companies").insert(params);
  console.log("🚀 ~ upsert ~ data, error:", data, error);
};
