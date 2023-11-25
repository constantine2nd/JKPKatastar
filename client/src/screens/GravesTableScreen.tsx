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
import { Box, createTheme, ThemeProvider, useTheme } from "@mui/material";
import { darken, styled } from "@mui/material/styles";

// MUI Chip
import Chip from "@mui/material/Chip";
import { srRS } from "@mui/material/locale";
import { getLanguage } from "../utils/languageSelector";
import { DeleteAndMaybeRemoveButton } from "../components/DetailAndMaybeRemoveButton";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef, //if using TypeScript (optional, but recommended)
} from "material-react-table";

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
  return capacity(renderedValue.split("/")[1], renderedValue.split("/")[0]);
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
      accessorKey: "graveType.name",
      header: t("grave type"),
    },
    {
      accessorKey: "cemetery.name",
      header: t("Cemetery"),
    },
    {
      accessorFn: (row) => `${row.numberOfDeceaseds}/${row.graveType.capacity}`, //accessorFn used to join multiple data into a single cell
      id: "occupation",
      header: t("occupation"),
      Cell: ({ renderedCellValue, row }) =>
        capacityExt(row.getValue("occupation")),
    },
    {
      accessorFn: (row) => new Date(row.contractTo),
      id: "contractTo",
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      header: t("contract-expiration-date"),
      Cell: ({ cell }) => expiredContract(cell.getValue<string>()),
    },
    {
      accessorKey: "_id",
      header: t(""),
      columnDefType: "display", //turns off data column features like sorting, filtering, etc.
      Cell: ({ row }) =>
        DeleteAndMaybeRemoveButton(
          row.original._id,
          "/single-grave",
          handleShowModal
        ),
    },
  ];

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
