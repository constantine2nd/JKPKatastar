import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import axios from "axios";
import { Modal, Form, Row, Col, Button, Table } from "react-bootstrap";
import ButtonMUI from "@mui/material/Button";
import Tooltip from "@mui/material";

import { dateFormatter } from "../utils/dateFormatter";
import {
  fetchDeceased,
  selectAllDeceased,
  getDeceasedStatus,
  getDeceasedError,
} from "../features/deceasedSlice";
import { selectUser } from "../features/userSlice";
import "./GraveTableScreen.css";
import { Grave, GraveData, Deceased } from "../interfaces/GraveIntefaces";
import Loader from "../components/Loader";
import Message from "../components/Message";

// MUI Table
import { createTheme, ThemeProvider, useTheme } from "@mui/material";
import { darken, styled } from "@mui/material/styles";

// MUI Chip
import Chip from "@mui/material/Chip";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import { getLanguage } from "../utils/languageSelector";
import { srRS } from "@mui/material/locale";
import { ADMINISTRATOR, OFFICER } from "../utils/constant.js";

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
const dateOfBirth = (date: string) => {
  return <Chip label={dateFormatter(date)} color="success" />;
};

const dateDeath = (date: string) => {
  return <Chip label={dateFormatter(date)} color="error" />;
};

const DeceasedTableScreen: React.FC = () => {
  //const [graves, setGraves] = useState<GraveData[]>([]);
  let navigate = useNavigate();
  const deceased: Deceased[] = useSelector(selectAllDeceased);
  const gravesStatus = useSelector(getDeceasedStatus);
  const error = useSelector(getDeceasedError);
  const user = useSelector(selectUser);
  const dispatch = useDispatch<any>();
  const [showModal, setShowModal] = useState(false);
  const [selectedGraveId, setSelectedGraveId] = useState<string>();
  const { t, i18n } = useTranslation();

  const columns: MRT_ColumnDef<Deceased>[] = [
    {
      accessorKey: "name",
      header: t("name"),
    },
    {
      accessorKey: "surname",
      header: t("surname"),
    },
    {
      accessorFn: (row) => new Date(row.dateBirth),
      id: "dateBirth",
      header: t("dateBirth"),
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateOfBirth(cell.getValue<string>()),
    },
    {
      accessorFn: (row) => new Date(row.dateDeath),
      id: "dateDeath",
      header: t("dateDeath"),
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateDeath(cell.getValue<string>()),
    },
    {
      accessorKey: "grave.field",
      header: t("field"),
    },
    {
      accessorKey: "grave.row",
      header: t("row"),
    },
    {
      accessorKey: "grave.number",
      header: t("number"),
    },
    {
      accessorKey: "grave.cemetery.name",
      header: t("cemetery"),
    },
    {
      accessorKey: "grave.graveType.name",
      header: t("grave type"),
    },
    {
      accessorKey: "grave._id",
      header: t(""),
      columnDefType: "display", //turns off data column features like sorting, filtering, etc.
      Cell: ({ renderedCellValue, row }) => (
        <ButtonMUI
          variant="contained"
          onClick={() => {
            navigate({
              pathname: "/single-grave",
              search: createSearchParams({
                id: row.getValue<string>("grave._id"),
              }).toString(),
            });
          }}
        >
          {t("details")}
        </ButtonMUI>
      ),
    },
  ];
  const theme = useTheme(); //replace with your theme/createTheme

  useEffect(() => {
    if (gravesStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchDeceased());
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
      //  dispatch(deleteSingleGrave(selectedGraveId));
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
          width: "100%",
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>{t("graves-table-screen")}</div>
        <br />
        {(user?.role === OFFICER || user?.role === ADMINISTRATOR) && (
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
            data={deceased}
            enableRowNumbers
            enablePagination={false}
            enableRowVirtualization
            //   rowNumberMode="original"
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

export default DeceasedTableScreen;
