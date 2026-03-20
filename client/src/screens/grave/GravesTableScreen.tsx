import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import ButtonMUI from "@mui/material/Button";
import { Modal } from "react-bootstrap";

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
import { getLanguage } from "../../utils/languageSelector.js";
import { useTableState } from "../../hooks/useTableState";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  capacityExt,
  expiredContract,
  statusOfGrave,
} from "../../components/CommonFuntions";
import { DeleteAndMaybeRemoveButton } from "../../components/DetailAndMaybeRemoveButton";
import { ADMINISTRATOR, OFFICER } from "../../utils/constant.js";

const GravesTableScreen: React.FC = () => {
  const navigate = useNavigate();
  const graves: GraveData[] = useSelector(selectAllGraves);
  const gravesStatus = useSelector(getGravesStatus);
  const error = useSelector(getGravesError);
  const user = useSelector(selectUser);
  const dispatch = useDispatch<any>();
  const [showModal, setShowModal] = useState(false);
  const [selectedGraveId, setSelectedGraveId] = useState<string>();
  const { t, i18n } = useTranslation();

  const {
    columnVisibility, setColumnVisibility,
    columnSizing, setColumnSizing,
    sorting, setSorting,
    density, setDensity,
    pagination, setPagination,
  } = useTableState("graves-table");

  useEffect(() => {
    if (gravesStatus === "idle") {
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

  const statuses = [
    { label: t("status.free"), value: "FREE" },
    { label: t("status.occupied"), value: "OCCUPIED" },
  ];

  const columns: MRT_ColumnDef<GraveData>[] = [
    {
      accessorKey: "number",
      header: t("grave.number"),
    },
    {
      accessorKey: "field",
      header: t("grave.field"),
    },
    {
      accessorKey: "row",
      header: t("grave.row"),
    },
    {
      accessorKey: "graveType.name",
      header: t("grave-type.title"),
    },
    {
      accessorKey: "cemetery.name",
      header: t("cemetery.title"),
    },
    {
      accessorFn: (row) => `${row.numberOfDeceaseds ?? 0}/${row.graveType?.capacity ?? 0}`,
      id: "occupation",
      header: t("grave.occupation"),
      Cell: ({ row }) => capacityExt(row.getValue("occupation")),
    },
    {
      accessorFn: (row) => new Date(row.contractTo),
      id: "contractTo",
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      header: t("grave.contract-expiration-date"),
      Cell: ({ cell }) => expiredContract(cell.getValue<string>()),
    },
    {
      accessorKey: "status",
      header: t("status.status"),
      Cell: ({ row }) => statusOfGrave(row.original.status),
    },
    {
      accessorKey: "_id",
      header: "",
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) =>
        DeleteAndMaybeRemoveButton(row.original._id, "/single-grave", handleShowModal),
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: graves,
    enableColumnResizing: true,
    enableStickyHeader: true,
    layoutMode: "semantic",
    localization: getLanguage(i18n),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    onDensityChange: setDensity,
    onPaginationChange: setPagination,
    renderTopToolbarCustomActions: () =>
      (user?.role === OFFICER || user?.role === ADMINISTRATOR) ? (
        <ButtonMUI
          variant="contained"
          onClick={() => navigate({ pathname: "/add-grave" })}
        >
          {t("grave.add")}
        </ButtonMUI>
      ) : null,
    muiTableContainerProps: {
      sx: {
        height: "calc(100vh - 184px)",
        overflowY: "auto",
      },
    },
    state: {
      columnVisibility,
      columnSizing,
      sorting,
      density,
      pagination,
      isLoading: gravesStatus === "loading",
    },
  });

  if (gravesStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return (
    <>
      <MaterialReactTable table={table} />
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
