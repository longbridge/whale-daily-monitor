import { get } from "lodash-es";
import { API } from "../api";
import config from "../config/aipo";

const getByCurrentConfig = async (params = {}) => {
  const pageSize = get(config, "params.pageSize", 100);
  const resp = await API.fetch(config.api, {
    params: { ...config.params, ...params },
    headers: config.headers,
    method: "GET",
  });

  if (!resp.err) {
    const data = get(resp, "data.dataList", []);
    if (data.length > 0) {
      console.log(
        "🚀 ~ getByCurrentConfig ~ resp:",
        config.params.pageIndex,
        get(resp, "data.dataList", [])
      );

      if (data.length === pageSize) {
        config.params.pageIndex += 1;
        getByCurrentConfig(config.params);
      }
    }
  }
};
getByCurrentConfig();
