import * as XLSX from "xlsx";

// 读取 Excel 模版
function readExcelTemplate(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = "SFC_COMPANY(sfc_company)";
  const worksheet = workbook.Sheets[sheetName];
  return { workbook, worksheet, sheetName };
}

// 将数据插入到 Excel
export const insertDataToExcel = (
  outputPath: string,
  dataArray: any,
  templatePath = "src/sites/hk_sfc/template.xlsx"
) => {
  dataArray.unshift({});

  const { workbook, worksheet, sheetName } = readExcelTemplate(templatePath);

  // 获取表头
  const headers: any[] = [];
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ c: col, r: range.s.r });
    const cell = worksheet[cellAddress];
    if (cell && cell.v) {
      headers.push(cell.v);
    }
  }

  // 插入数据
  dataArray.forEach((data: any, rowIndex: any) => {
    headers.forEach((header, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({
        c: colIndex,
        r: rowIndex + 1 + range.s.r,
      });
      worksheet[cellAddress] = { v: data[header] };
    });
  });

  // 更新范围
  const newRange = XLSX.utils.decode_range(worksheet["!ref"] || "");
  newRange.e.r = range.s.r + dataArray.length;
  worksheet["!ref"] = XLSX.utils.encode_range(newRange);

  // 写入新的 Excel 文件
  XLSX.writeFile(workbook, outputPath);
};
