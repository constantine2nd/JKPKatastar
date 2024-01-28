import React, { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";

function ExcelToJsonConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState("");

  const handleConvert = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const res = json.reduce((acc: any, cur: any, index, arr) => {
          const { name, surname, birth, death } = cur;
          let decObj = { name, surname, birth, death };
          if (cur.type) {
            const { field, row, number, type, LAT, LON } = cur;
            const peopleArray: Array<{
              name: any;
              surname: any;
              birth: any;
              death: any;
            }> = [];
            let graveObj = {
              field,
              row,
              number,
              type,
              LAT,
              LON,
              deceased: peopleArray,
            };
            graveObj.deceased.push(decObj);
            acc.push(graveObj);
          } else {
            acc[acc.length - 1].deceased.push(decObj);
          }
          return acc;
        }, []);

        setJsonData(JSON.stringify(res, null, 2));
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const selected = files[0];
      setFile(selected);
    }
  };

  return (
    <div>
      <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
      <button onClick={handleConvert}>Convert</button>
      <pre>{jsonData}</pre>
    </div>
  );
}

export default ExcelToJsonConverter;
