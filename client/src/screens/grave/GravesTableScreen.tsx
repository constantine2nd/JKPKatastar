import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import ButtonMUI from "@mui/material/Button";
import { Modal } from "react-bootstrap";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  deleteSingleGrave,
  fetchAllGraves,
  getGravesError,
  getGravesStatus,
  selectAllGraves,
} from "../../features/gravesSlice";
import { selectUser } from "../../features/userSlice";
import { GraveData } from "../../interfaces/GraveIntefaces.js";
import "./GraveTableScreen.css";

// MUI Table
import { createTheme, ThemeProvider, useTheme } from "@mui/material";
import { darken } from "@mui/material/styles";

// MUI Chip
import { srRS } from "@mui/material/locale";
import { DeleteAndMaybeRemoveButton } from "../../components/DetailAndMaybeRemoveButton";
import { getLanguage } from "../../utils/languageSelector.js";

import {
  MaterialReactTable,
  type MRT_ColumnDef
} from "material-react-table";
import { capacityExt, expiredContract, statusOfGrave } from "../../components/CommonFuntions";
import { ADMINISTRATOR, OFFICER } from "../../utils/constant.js";


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

  const statuses = [
    { label: t('FREE'), value: 'FREE' },
    { label: t('OCCUPIED'), value: 'OCCUPIED' },
  ]

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
      accessorKey: "status",
      header: t("status"),
      editVariant: 'select',
      editSelectOptions: statuses,
      Cell: ({ row }) => (
        statusOfGrave(row.original.status, t)
      ),
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
