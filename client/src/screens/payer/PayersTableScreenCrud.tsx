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
import { Payer } from "../../interfaces/GraveIntefaces";
import { t } from "i18next";
import {
  useCreateRow,
  useDeleteRow,
  useGetRows,
  useUpdateRow,
} from "../../hooks/useCrudHooks";
import { isActivePayer } from "../../components/CommonFuntions";

// Defines the name of the react query
const queryFunction = "payer-all";
// Defines CRUD paths

interface MyComponentProps {
  graveId: string;
}

const PayersTableScreenCrud: React.FC<MyComponentProps> = (props) => {
  const getPath = `/api/payer/all/${props.graveId}`;
  const createPath = `/api/payer/addpayer/${props.graveId}`;
  const updatePath = "/api/payer/updatepayer";
  const deletePath = "/api/payer";
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { t, i18n } = useTranslation();

  const active = [
    { label: t("yes"), value: true },
    { label: t("no"), value: false },
  ];

  const columns: MRT_ColumnDef<Payer>[] = [
    {
      accessorKey: "_id",
      header: "Id",
      enableEditing: false,
    },
    {
      accessorKey: "name",
      header: t("name"),
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
            surname: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
    },
    {
      accessorKey: "address",
      header: t("address"),
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.address,
        helperText: validationErrors?.address,
        //remove any previous validation errors when user focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            address: undefined,
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
            phone: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
    },
    {
      accessorKey: "jmbg",
      header: t("jmbg"),
      muiEditTextFieldProps: {
        type: "number",
        required: true,
        error: !!validationErrors?.jmbg,
        helperText: validationErrors?.jmbg,
        //remove any previous validation errors when user focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            jmbg: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
    },
    {
      accessorKey: "active",
      header: t("Active"),
      editVariant: "select",
      editSelectOptions: active,
      muiEditTextFieldProps: {
        select: true,
      },
      Cell: ({ row }) => isActivePayer(row.original.active),
    },
  ];

  // call CREATE hook
  const {
    mutateAsync: createRow,
    isPending: isCreatingRow,
    isError: isCreatingDataError,
    error: creatingDataError,
  } = useCreateRow(queryFunction, createPath);
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
    return (
      isLoadingDataError ||
      isCreatingDataError ||
      isUpdatingDataError ||
      isUDeletingDataError
    );
  }

  function errorMessage() {
    return (
      loadingDataError?.message ||
      creatingDataError?.message ||
      updatingDataError?.message ||
      deletingDataError?.message
    );
  }

  // CREATE action
  const handleCreatePayer: MRT_TableOptions<Payer>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validatePayer(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createRow(values).catch((error: any) => console.log(error));
      table.setCreatingRow(null); //exit creating mode
    };

  // UPDATE action
  const handleSaveRow: MRT_TableOptions<Payer>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validatePayer(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateRow(values).catch((error: any) => console.log(error));
    table.setEditingRow(null); //exit editing mode
  };

  // DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Payer>) => {
    if (window.confirm(t("Are you sure you want to delete this user?"))) {
      deleteRow(row.original._id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedData,
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
        minHeight: "100px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreatePayer,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveRow,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t("Create New Payer")}</DialogTitle>
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
        <DialogTitle variant="h3">{t("Edit Payer")}</DialogTitle>
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
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        {t("Create New Payer")}
      </Button>
    ),
    state: {
      isLoading: isLoadingData,
      isSaving: isCreatingRow || isUpdatingRow || isDeletingRow,
      showAlertBanner: errorOccuried(),
      showProgressBars: isFetchingData,
    },
  });

  return <MaterialReactTable table={table} />;
};

//const PayersTableScreenCrudWithProviders = () => <PayersTableScreenCrud />;

export default PayersTableScreenCrud;

const validateRequired = (value: string) => !!value.length;

function validatePayer(row: Payer) {
  return {
    name: !validateRequired(row.name) ? t("Name is Required") : "",
  };
}
