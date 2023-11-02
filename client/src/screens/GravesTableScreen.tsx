import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import axios from "axios";
import { Modal, Form, Row, Col, Button, Table } from "react-bootstrap";
import ButtonMUI from "@mui/material/Button";

import { dateFormatter } from "../utils/dateFormatter";
import {
  selectAllGraves,
  fetchAllGraves,
  getGravesStatus,
  getGravesError,
  deleteSingleGrave,
} from "../features/gravesSlice";
import { selectUser } from "../features/userSlice";
import "./GraveTableScreen.css";
import { Grave, GraveData } from "../interfaces/GraveIntefaces";
import Loader from "../components/Loader";
import Message from "../components/Message";

// MUI Table
import { createTheme, ThemeProvider, useTheme } from "@mui/material";
import { darken, styled } from "@mui/material/styles";

// MUI Chip
import Chip from "@mui/material/Chip";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import { User } from "../interfaces/UserInterfaces";
import { MRT_Localization_HU } from "material-react-table/locales/hu";
//Import Material React Table Translations
import { MRT_Localization_SR_CYRL_RS } from "material-react-table/locales/sr-Cyrl-RS";
//Import Material React Table Translations
import { MRT_Localization_SR_LATN_RS } from "material-react-table/locales/sr-Latn-RS";
import { srRS } from "@mui/material/locale";

const capacity = (capacity: string, numberOfDeceaseds: string) => {
  let result = null;
  const capacityNum = Number(capacity);
  const deceasedsNum = Number(numberOfDeceaseds);
  if (capacityNum - deceasedsNum === 0) {
    result = <Chip label={`${numberOfDeceaseds}/${capacity}`} color="error" />;
  } else if (deceasedsNum / capacityNum > 0.49) {
    result = (
      <Chip label={`${numberOfDeceaseds}/${capacity}`} color="warning" />
    );
  } else {
    result = (
      <Chip label={`${numberOfDeceaseds}/${capacity}`} color="success" />
    );
  }
  return result;
};

const expiredContract = (contractTo: string) => {
  let result = null;
  let contractDate = new Date(contractTo);
  let contractDatePlus = new Date(contractTo);
  contractDatePlus.setMonth(contractDatePlus.getMonth() - 3);
  let today = new Date();
  if (today > contractDate) {
    result = <Chip label={dateFormatter(contractTo)} color="error" />;
  } else if (today > contractDatePlus) {
    result = <Chip label={dateFormatter(contractTo)} color="warning" />;
  } else {
    result = <Chip label={dateFormatter(contractTo)} color="success" />;
  }
  return result;
};

const capacityExt = (renderedValue: string) => {
  console.log(renderedValue);
  return capacity(renderedValue.split("/")[0], renderedValue.split("/")[1]);
};

const GravesTableScreen: React.FC = () => {
  //const [graves, setGraves] = useState<GraveData[]>([]);
  let navigate = useNavigate();
  const graves: GraveData[] = useSelector(selectAllGraves);
  const gravesStatus = useSelector(getGravesStatus);
  const error = useSelector(getGravesError);
  const user = useSelector(selectUser);
  const dispatch = useDispatch<any>();
  const [showModal, setShowModal] = useState(false);
  const [selectedGraveId, setSelectedGraveId] = useState<string>();
  const { t, i18n } = useTranslation();
  const getLanguage = () => {
    if (i18n.language.toUpperCase() === "SR") {
      return MRT_Localization_SR_LATN_RS;
    } else if (i18n.language.toUpperCase() === "HU") {
      return MRT_Localization_HU;
    } else {
      return MRT_Localization_SR_CYRL_RS;
    }
  };
  const columns: MRT_ColumnDef<GraveData>[] = [
    {
      accessorKey: "number",
      header: t("number"),
    },
    {
      accessorKey: "field",
      header: t("field"),
    },
    {
      accessorKey: "row",
      header: t("row"),
    },
    {
      accessorFn: (row) => `${row.numberOfDeceaseds}/${row.capacity}`, //accessorFn used to join multiple data into a single cell
      id: "occupation",
      header: t("occupation"),
      Cell: ({ renderedCellValue, row }) =>
        capacityExt(row.getValue("occupation")),
    },
    {
      accessorFn: (row) => new Date(row.contractTo),
      id: "contractTo",
      header: t("contract-expiration-date"),
      Cell: ({ cell }) => expiredContract(cell.getValue<string>()),
    },
    {
      accessorKey: "_id",
      id: "details",
      header: t(""),
      Cell: ({ renderedCellValue, row }) => (
        <ButtonMUI
          variant="contained"
          onClick={() => {
            navigate({
              pathname: "/single-grave",
              search: createSearchParams({
                id: row.getValue<string>("_id"),
              }).toString(),
            });
          }}
        >
          {t("details")}
        </ButtonMUI>
      ),
    },
    /*     {
      accessorKey: "_id",
      header: t(""),
      Cell: ({ renderedCellValue, row }) =>
        (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
          <ButtonMUI
            variant="contained"
            color="secondary"
            onClick={() => handleShowModal(row.getValue<string>("_id"))}
          >
            {t("delete")}
          </ButtonMUI>
        ),
    }, */
  ];

  if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
    columns.push({
      accessorKey: "_id",
      id: "delete",
      header: t(""),
      Cell: ({ renderedCellValue, row }) => (
        <ButtonMUI
          variant="contained"
          color="secondary"
          onClick={() => handleShowModal(row.getValue<string>("_id"))}
        >
          {t("delete")}
        </ButtonMUI>
      ),
    });
  }

  const theme = useTheme(); //replace with your theme/createTheme

  useEffect(() => {
    if (gravesStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchAllGraves());
    }
  }, [gravesStatus, dispatch]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGraveId("");
  };

  const handleShowModal = (id: string) => {
    setSelectedGraveId(id);
    setShowModal(true);
  };

  const handleDeleteGrave = () => {
    if (selectedGraveId) {
      dispatch(deleteSingleGrave(selectedGraveId));
      setShowModal(false);
    }
  };

  if (gravesStatus === "loading") {
    return <Loader />;
  }

  if (gravesStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return (
    <>
      <div
        style={{
          height: "50vw",
          width: "100%",
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>{t("graves-table-screen")}</div>
        <br />
        {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
          <ButtonMUI
            variant="contained"
            sx={{ m: 2 }}
            onClick={() => {
              navigate({
                pathname: "/add-grave",
              });
            }}
          >
            {t("add grave")}
          </ButtonMUI>
        )}
        <br />

        <ThemeProvider theme={createTheme(theme, srRS)}>
          <MaterialReactTable
            columns={columns}
            data={graves}
            enableRowNumbers
            rowNumberMode="original"
            localization={getLanguage()}
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
                  backgroundColor: darken(
                    theme.palette.background.default,
                    0.05
                  ),
                },
              }),
            }}
            muiTableHeadCellProps={{
              sx: (theme) => ({
                backgroundColor: darken(theme.palette.background.default, 0.3),
              }),
            }}
          />
          ;
        </ThemeProvider>
        <br />
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Brisanje grobnog mesta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Da li ste sigurni da zelite da izbrisete grobno mesto?
        </Modal.Body>
        <Modal.Footer>
          <ButtonMUI color="secondary" onClick={handleCloseModal}>
            Nazad
          </ButtonMUI>
          <ButtonMUI color="primary" onClick={handleDeleteGrave}>
            Da
          </ButtonMUI>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GravesTableScreen;
