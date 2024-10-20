import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://ermcuynsclygxikpdhgh.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "not_set_yet";

export const client = () => {
  return createClient(supabaseUrl, supabaseKey);
};

export const upsert = async (params: any, table_key = "sfc_companies") => {
  const { data, error } = await client().from(table_key).upsert(params);
  console.log("🚀 ~ upsert ~ data, error:", data, error);
};

export const insert = async (params: any, table_key = "sfc_companies") => {
  const { data, error } = await client().from(table_key).insert(params);
  console.log("🚀 ~ insert ~ data, error:", data, error);
};

export const select = async (column = "*", table_key = "sfc_companies") => {
  let { data, error } = await client().from(table_key).select(column);
  return data;
};
