import React, { ChangeEvent, useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchCemeteries,
  selectAllCemeteries,
} from "../../features/cemeteriesSlice";

function ExcelToJsonConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState("");
  const [selectedCemeteryId, setSelectedCemeteryId] = useState("");

  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const cemeteries = useSelector(selectAllCemeteries);

  useEffect(() => {
    dispatch(fetchCemeteries());
  }, []);

  const handleConvert = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
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
        //sending data to backend
        const dataToSend = { graves: res, cemeteryId: selectedCemeteryId };

        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const response = await axios.post(
          `/api/graves/new-from-excel`,
          dataToSend,
          config,
        );
        ///////////////
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

  const handleSelectCemetery = (event: any) => {
    console.log(event.target.value);
    setSelectedCemeteryId(event.target.value);
  };

  return (
    <div>
      <Box sx={{ maxWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Cemeteries</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedCemeteryId}
            label={t("cemetery.title")}
            onChange={handleSelectCemetery}
          >
            {cemeteries.map((cemetery) => (
              <MenuItem key={cemetery._id} value={cemetery._id}>
                {cemetery.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
      <button onClick={handleConvert}>Convert</button>
      <pre>{jsonData}</pre>
    </div>
  );
}

export default ExcelToJsonConverter;
