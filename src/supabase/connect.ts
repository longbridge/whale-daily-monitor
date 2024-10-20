import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://ermcuynsclygxikpdhgh.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybWN1eW5zY2x5Z3hpa3BkaGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwNDg4NTUsImV4cCI6MjA0NDYyNDg1NX0.j446M4GGnASP2bP4YATqBxiWQ-NAfhGU5rTUBUhS4k4";

export const upsert = async (params: any, table_key = "sfc_companies") => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from(table_key).upsert(params);
  console.log("🚀 ~ upsert ~ data, error:", data, error);
};

export const insert = async (params: any, table_key = "sfc_companies") => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from(table_key).insert(params);
  console.log("🚀 ~ insert ~ data, error:", data, error);
};

export const select = async (column = "*", table_key = "sfc_companies") => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  let { data, error } = await supabase.from(table_key).select(column);
  return data;
};
