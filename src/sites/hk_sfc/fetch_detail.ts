import { get, uniqBy } from "lodash-es";
import { getDetailInfo } from "./detail";

// 批量处理函数
export const processInBatches = async (data: any[], batchSize: number) => {
  const results = [];

  const chunks = chunkArray(data, batchSize);

  for (const [index, chuck] of chunks.entries()) {
    const start_time = Date.now();
    console.log(`Processing chunk ${index + 1} of ${chunks.length}`);
    const batchResults = await Promise.all(chuck.map(fetchDetail));
    console.log(
      `Processing chunk end ${index + 1} of ${chunks.length}`,
      Date.now() - start_time
    );

    results.push(...batchResults);
  }

  console.log("all_done");

  return results;
};

export const fetchDetail = async (item: any) => {
  try {
    await getDetailInfo(item);
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

function chunkArray(array: any[], size: number) {
  const result = [];

  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size);
    result.push(chunk);
  }

  return result;
}
