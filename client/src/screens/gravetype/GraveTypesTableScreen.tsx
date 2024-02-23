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
import Loader from "../../components/Loader";
import Message from "../../components/Message";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
//Import Material React Table Translations
import { MRT_Localization_SR_CYRL_RS } from "material-react-table/locales/sr-Cyrl-RS";
//Import Material React Table Translations
import { MRT_Localization_SR_LATN_RS } from "material-react-table/locales/sr-Latn-RS";
//Import Material React Table Translations
import { MRT_Localization_HU } from "material-react-table/locales/hu";

import {
  getAllGraveTypes,
  selectAllGraveTypes,
  getAllGraveTypesStatus,
  getAllGraveTypesError,
} from "../../features/graveTypesSlice";

import { GraveType } from "../../interfaces/GraveTypeInterfaces";
import { getLanguage } from "../../utils/languageSelector";
import { t } from "i18next";

const GraveTypesTableScreen: React.FC = () => {
  const graveTypes: GraveType[] | null = useSelector(selectAllGraveTypes);
  const { t, i18n } = useTranslation();
  //should be memoized or stable
  const columns: MRT_ColumnDef<GraveType>[] = [
      {
        accessorKey: "_id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: t("name"),
      },
      {
        accessorKey: "capacity",
        header: t("capacity"),
      },
      {
        accessorKey: "description",
        header: t("description"),
      },
    ];
  const graveTypesStatus = useSelector(getAllGraveTypesStatus);
  const error = useSelector(getAllGraveTypesError);
  const dispatch = useDispatch<any>();
  useEffect(() => {
    if (graveTypesStatus === "idle") {
      console.log("UPAO");
      dispatch(getAllGraveTypes());
    }
  }, [graveTypesStatus, dispatch]);

  if (graveTypesStatus === "loading") {
    return <Loader />;
  }

  if (graveTypesStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return (
    <>
      <h1>Users table screen</h1>
      <MaterialReactTable
        columns={columns}
        data={graveTypes ? graveTypes : []}
        enableRowNumbers
        //  rowNumberMode="original"
        localization={getLanguage(i18n)}
        muiTablePaperProps={{
          elevation: 0,
          sx: {
            borderRadius: "0",
            border: "1px dashed #e0e0e0",
          },
        }}
        muiTableBodyProps={{
          sx: (theme) => ({
            "& tr:nth-of-type(odd) > td": {
              backgroundColor: darken(theme.palette.background.default, 0.1),
            },
          }),
        }}
      />
      ;
    </>
  );
};

export default GraveTypesTableScreen;
function createTheme(arg0: { palette: { mode: string } }) {
  throw new Error("Function not implemented.");
}
