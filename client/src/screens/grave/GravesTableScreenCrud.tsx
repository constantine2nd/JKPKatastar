import { useState, useEffect } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../utils/languageSelector";
import { t } from "i18next";
import {
  useCreateRow,
  useDeleteRow,
  useGetRows,
  useUpdateRow,
} from "../../hooks/useCrudHooks";
import { GraveData as CrudTableType } from "../../interfaces/GraveIntefaces";
import { dateFormatter } from "../../utils/dateFormatter";
import {
  capacityExt,
  expiredContract,
  statusOfGrave,
} from "../../components/CommonFuntions";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllGraveTypes,
  selectAllGraveTypes,
} from "../../features/graveTypesSlice";
import {
  fetchCemeteries,
  selectAllCemeteries,
} from "../../features/cemeteriesSlice";
import { GraveType } from "../../interfaces/GraveTypeInterfaces";
import { Cemetery } from "../../interfaces/CemeteryInterfaces";
import { FREE, OCCUPIED } from "../../utils/constant";

// Defines the name of the react query
const queryFunction = "graves-all";
// Defines CRUD paths
const getPath = "/api/graves/all";
const createPath = "/api/graves/addgraverequest";
const updatePath = "/api/graves/updategrave";
const deletePath = "/api/graves/single";

const GravesTableScreenCrud = () => {
  const [open, setOpen] = useState(false);
  const [idOfrowToDelete, setIdOfRowToDelete] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const graveTypes: GraveType[] | null = useSelector(selectAllGraveTypes);
  const cemeteries: Cemetery[] | null = useSelector(selectAllCemeteries);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<any>();

  useEffect(() => {
    dispatch(getAllGraveTypes());
    dispatch(fetchCemeteries());
  }, []);
  const statuses = [
    { label: t(FREE), value: FREE },
    { label: t(OCCUPIED), value: OCCUPIED },
  ];

  const myGraveTypes = graveTypes.map((item) => {
    return {
      label: item.name,
      value: item._id,
    };
  });

  const myCemeteries = cemeteries.map((item) => {
    return {
      label: item.name,
      value: item._id,
    };
  });

  const columns: MRT_ColumnDef<CrudTableType>[] = [
    {
      accessorKey: "cemetery.name",
      header: t("Cemetery"),
      editVariant: "select",
      editSelectOptions: myCemeteries,
      enableEditing: true,
      /* Cell: ({ row }) =>
        cemeteries.find((item) => item._id === row.original.cemetery._id)?.name, */
    },
    {
      accessorKey: "number",
      header: t("number"),
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.number,
        helperText: validationErrors?.number,
        //remove any previous validation errors when user focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            name: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
    },
    {
      accessorKey: "field",
      header: t("field"),
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.field,
        helperText: validationErrors?.field,
        //remove any previous validation errors when user focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            name: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
    },
    {
      accessorKey: "row",
      header: t("row"),
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.row,
        helperText: validationErrors?.row,
        //remove any previous validation errors when user focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            name: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
    },
    {
      accessorKey: "graveType._id",
      header: t("grave type"),
      editVariant: "select",
      editSelectOptions: myGraveTypes,
      enableEditing: true,
      Cell: ({ row }) =>
        graveTypes.find((item) => item._id === row.original.graveType._id)
          ?.name,
    },
    {
      accessorKey: "_id",
      header: "Id",
      enableEditing: false,
    },
    {
      accessorFn: (row) => new Date(row.contractTo),
      id: "contractTo",
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      header: t("contract-expiration-date"),
      Cell: ({ cell }) => expiredContract(cell.getValue<string>()),
      enableEditing: false,
    },
    {
      accessorFn: (row) => {
        console.log(row);
        return `${row.numberOfDeceaseds}/${row.graveType?.capacity}`;
      }, //accessorFn used to join multiple data into a single cell
      id: "occupation",
      header: t("occupation"),
      enableEditing: false,
      Cell: ({ renderedCellValue, row }) =>
        capacityExt(row.getValue("occupation")),
    },
    {
      accessorKey: "status",
      header: t("status"),
      editVariant: "select",
      editSelectOptions: statuses,
      Cell: ({ row }) => statusOfGrave(row.original.status),
    },
  ];

  // call READ hook
  const {
    data: fetchedData = [],
    isError: isLoadingDataError,
    error: loadingDataError,
    isFetching: isFetchingData,
    isLoading: isLoadingData,
  } = useGetRows(queryFunction, getPath);
  // call UPDATE hook
  const {
    mutateAsync: updateRow,
    isPending: isUpdatingRow,
    isError: isUpdatingDataError,
    error: updatingDataError,
  } = useUpdateRow(queryFunction, updatePath);
  // call DELETE hook
  const {
    mutateAsync: deleteRow,
    isPending: isDeletingRow,
    isError: isUDeletingDataError,
    error: deletingDataError,
  } = useDeleteRow(queryFunction, deletePath);

  function errorOccuried() {
    return isLoadingDataError || isUpdatingDataError || isUDeletingDataError;
  }

  function errorMessage() {
    return (
      loadingDataError?.message ||
      updatingDataError?.message ||
      deletingDataError?.message
    );
  }

  // UPDATE action
  const handleSaveRow: MRT_TableOptions<CrudTableType>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateCrudTable(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateRow(values).catch((error) => console.log(error));
      table.setEditingRow(null); //exit editing mode
    };

  // DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<CrudTableType>) => {
    setIdOfRowToDelete(row.original._id);
    setOpen(true);
    /* if (window.confirm("Are you sure you want to delete this user?")) {
      deleteRow(row.original._id);
    } */
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = () => {
    if (idOfrowToDelete !== "") {
      deleteRow(idOfrowToDelete).catch((error) => console.log(error));
    }
    setOpen(false);
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedData,
    enableColumnResizing: true,
    layoutMode: "semantic",
    initialState: { columnVisibility: { _id: false } }, //hide _id column by default
    localization: getLanguage(i18n),
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row._id,
    muiToolbarAlertBannerProps: errorOccuried()
      ? {
          color: "error",
          children: errorMessage(),
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveRow,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t("Create New Grave Type")}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t("Edit Grave Type")}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title={t("Edit")}>
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("Delete")}>
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        onClick={() => {
          const url = "/add-grave";
          window.open(url, "_blank");
        }}
      >
        {t("add grave")}
      </Button>
    ),
    state: {
      isLoading: isLoadingData,
      isSaving: isUpdatingRow || isDeletingRow,
      showAlertBanner: errorOccuried(),
      showProgressBars: isFetchingData,
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Deleting grave?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this grave?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleAgree} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const GravesTableScreenCrudWithProviders = () => <GravesTableScreenCrud />;

export default GravesTableScreenCrudWithProviders;

const validateRequired = (value: string) => {
  return String(value).split("").length;
};

function validateCrudTable(tableRow: CrudTableType) {
  return {
    number: !validateRequired(tableRow.number)
      ? t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")
      : "",
    field: !validateRequired(tableRow.field)
      ? t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")
      : "",
    row: !validateRequired(tableRow.row)
      ? t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")
      : "",
  };
}
