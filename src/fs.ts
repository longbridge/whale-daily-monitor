const fs = require("fs");

export const writeFile = (data: any, name = "data") => {
  fs.writeFileSync(`./${name}.json`, JSON.stringify(data, null, 2));
};
