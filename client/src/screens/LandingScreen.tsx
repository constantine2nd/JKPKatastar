import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
// MUI Table
import { styled } from "@mui/material/styles";
import { darken } from "@mui/material";
import TableMUI from "@mui/material/Table";
import TableBodyMUI from "@mui/material/TableBody";
import TableCellMUI, { tableCellClasses } from "@mui/material/TableCell";
import TableContainerMUI from "@mui/material/TableContainer";
import TableHeadMUI from "@mui/material/TableHead";
import TableRowMUI from "@mui/material/TableRow";
import PaperMUI from "@mui/material/Paper";
import Loader from "../components/Loader";
import Message from "../components/Message";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
//Import Material React Table Translations
import { MRT_Localization_SR_CYRL_RS } from "material-react-table/locales/sr-Cyrl-RS";
//Import Material React Table Translations
import { MRT_Localization_SR_LATN_RS } from "material-react-table/locales/sr-Latn-RS";
//Import Material React Table Translations
import { MRT_Localization_HU } from "material-react-table/locales/hu";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import {
  fetchCemeteries,
  selectAllCemeteries,
  getAllCemeteriesError,
  getAllCemeteriesStatus,
} from "../features/cemeteriesSlice";

import { Cemetery } from "../interfaces/CemeteryInterfaces";

const LandingScreen: React.FC = () => {
  const cemeteries: Cemetery[] | null = useSelector(selectAllCemeteries);
  const [cemeteryId, setCemeteryId] = React.useState("");
  let navigate = useNavigate();

  const handleChange = (event: SelectChangeEvent) => {
    const selectedCemetery = cemeteries?.find(
      (cem) => cem._id === event.target.value
    );
    navigate("/", { state: { cemetery: selectedCemetery } });
    // setCemeteryId(event.target.value as string);
  };

  const usersStatus = useSelector(getAllCemeteriesStatus);
  const error = useSelector(getAllCemeteriesError);
  const dispatch = useDispatch<any>();
  useEffect(() => {
    if (usersStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchCemeteries());
    }
  }, [usersStatus, dispatch]);

  if (usersStatus === "loading") {
    return <Loader />;
  }

  if (usersStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return (
    <>
      <h1>Landing page screen</h1>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Groblje</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={cemeteryId}
            label="Age"
            onChange={handleChange}
          >
            {cemeteries?.map((cemetery) => (
              <MenuItem value={cemetery._id}>{cemetery.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </>
  );
};

export default LandingScreen;
function createTheme(arg0: { palette: { mode: string } }) {
  throw new Error("Function not implemented.");
}
