import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { main } from "./sfc_company";

const argv = yargs(hideBin(process.argv))
  .option("ids", {
    type: "string",
    describe: "Comma separated list of ids",
    demandOption: false,
  })
  .option("all", {
    type: "string",
    describe: "Fetch all work items",
    default: false,
  }).argv;

(async () => {
  const resolvedArgv = await argv;
  if (!resolvedArgv.all && !resolvedArgv.ids) {
    console.warn("--> error! use args: --ids=1,2,3 or --all true");
    return;
  }
  if (resolvedArgv.all == "true") {
    console.log("--> start fetching all work items!");
    await main();
  } else {
    const ids = resolvedArgv.ids?.split(",") || [];
    console.log("--> start fetching companies with ids:", ids);
    await main(ids);
  }
})();
