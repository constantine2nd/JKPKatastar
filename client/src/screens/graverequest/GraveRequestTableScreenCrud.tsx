import { useState } from "react";
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
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../utils/languageSelector";
import { GraveType } from "../../interfaces/GraveTypeInterfaces";
import { t } from "i18next";
import {
  useCreateRow,
  useDeleteRow,
  useGetRows,
  useUpdateRow,
} from "../../hooks/useCrudHooks";
import { GraveRequest as CrudTableType } from "../../interfaces/GraveRequestInterfaces";
import { statusOfGraveRequest } from "../../components/CommonFuntions";
import { dateFormatter } from "../../utils/dateFormatter";
import { ACCEPTED, DENIED, REQUESTED } from "../../utils/constant";

// Defines the name of the react query
const queryFunction = "grave-types-all";
// Defines CRUD paths
const getPath = "/api/grave-requests/all";
const createPath = "/api/grave-requests/addgraverequest";
const updatePath = "/api/grave-requests/updategraverequest";
const deletePath = "/api/grave-requests";

const GraveRequestTableScreenCrud = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { t, i18n } = useTranslation();

  const statuses = [
    { label: t(REQUESTED), value: REQUESTED },
    { label: t(ACCEPTED), value: ACCEPTED },
    { label: t(DENIED), value: DENIED },
  ];

  const columns: MRT_ColumnDef<CrudTableType>[] = [
    {
      accessorKey: "name",
      header: t("form.name"),
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.name,
        helperText: validationErrors?.name,
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
      accessorKey: "surname",
      header: t("surname"),
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.surname,
        helperText: validationErrors?.surname,
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
      accessorKey: "email",
      header: t("form.email"),
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.email,
        helperText: validationErrors?.email,
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
      accessorKey: "phone",
      header: t("phone"),
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.phone,
        helperText: validationErrors?.phone,
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
      accessorKey: "status",
      header: t("status"),
      editVariant: "select",
      editSelectOptions: statuses,
      Cell: ({ row }) => statusOfGraveRequest(row.original.status),
    },
    {
      accessorFn: (row) => new Date(row.createdAt),
      id: "createdAt",
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      header: t("created-at"),
      Cell: ({ cell }) => dateFormatter(cell.getValue<string>()),
    },
    {
      accessorKey: "_id",
      header: "Id",
      enableEditing: false,
    },
    {
      accessorKey: "grave",
      header: t("Grave ID"),
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
      const newValidationErrors = validateGraveType(values);
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
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteRow(row.original._id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedData,
    enableColumnResizing: true,
    layoutMode: "grid",
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
        <DialogTitle variant="h3">{t("grave-request.create-new")}</DialogTitle>
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
          const url = "/grave-requests-stepper";
          window.open(url, "_blank");
        }}
      >
        {t("grave-request.create-new")}
      </Button>
    ),
    state: {
      isLoading: isLoadingData,
      isSaving: isUpdatingRow || isDeletingRow,
      showAlertBanner: errorOccuried(),
      showProgressBars: isFetchingData,
    },
  });

  return <MaterialReactTable table={table} />;
};

const GraveRequestTableScreenCrudWithProviders = () => (
  <GraveRequestTableScreenCrud />
);

export default GraveRequestTableScreenCrudWithProviders;

const validateRequired = (value: string) => !!value.length;

function validateGraveType(row: CrudTableType) {
  return {
    name: !validateRequired(row.name) ? t("client.err-field-required") : "",
    surname: !validateRequired(row.surname)
      ? t("client.err-field-required")
      : "",
    email: !validateRequired(row.email) ? t("client.err-field-required") : "",
    phone: !validateRequired(row.phone) ? t("client.err-field-required") : "",
  };
}
