import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { HK_SFC } from "./entry";
import { uniq } from "lodash-es";

const hk_sfc = new HK_SFC();

// 使用 yargs 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option("ids", {
    alias: "d",
    type: "string",
    describe: "JSON formatted data",
    coerce: (arg) => {
      try {
        return arg.split(",").filter(Boolean);
      } catch (e) {
        return [];
      }
    },
  })
  .help().argv;
// @ts-ignore
const init_ids = argv.ids || [];

if (init_ids.length > 0) {
  hk_sfc.update_by_partial(uniq(init_ids).join(","));
} else {
  hk_sfc.check_list();
}
