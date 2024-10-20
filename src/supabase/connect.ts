import { createClient, SupabaseClient } from "@supabase/supabase-js";
const supabaseUrl = "https://ermcuynsclygxikpdhgh.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "not_set_yet";

export const supabase = createClient(supabaseUrl, supabaseKey);

let isLogin = false;
export async function loginUser() {
  if (isLogin) {
    return;
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_EMAIL || "",
    password: process.env.SUPABASE_PASSWORD || "",
  });
  if (error) {
    console.error("login failed", error.message);
    throw error;
  }
  isLogin = true;
}

export const upsert = async (params: any, table_key = "sfc_companies") => {
  await loginUser();
  const { data, error } = await supabase.from(table_key).upsert(params);
  console.log("🚀 ~ upsert ~ data, error:", data, error);
};

export const insert = async (params: any, table_key = "sfc_companies") => {
  await loginUser();
  const { data, error } = await supabase.from(table_key).insert(params);
  console.log("🚀 ~ insert ~ data, error:", data, error);
};

export const select = async (column = "*", table_key = "sfc_companies") => {
  await loginUser();
  let { data, error } = await supabase.from(table_key).select(column);
  return data;
};
