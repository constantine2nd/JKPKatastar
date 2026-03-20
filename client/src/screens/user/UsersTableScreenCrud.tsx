import { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { useTableState } from "../../hooks/useTableState";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { User } from "../../interfaces/UserInterfaces.js";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../utils/languageSelector.js";
import {
  useCreateRow,
  useDeleteRow,
  useGetRows,
  useUpdateRow,
} from "../../hooks/useCrudHooks";
import { ADMINISTRATOR, OFFICER, VISITOR, MAINTAINER } from "../../utils/constant.js";
import { isActiveUser } from "../../components/CommonFuntions";

// Defines the name of the react query
const queryFunction = "users-all";
// Defines CRUD paths
const getPath = "/api/users";
const createPath = "/api/users/adduser";
const updatePath = "/api/users/updateuser";
const deletePath = "/api/users";

const UsersTableScreenCrud = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const {
    columnVisibility, setColumnVisibility,
    columnSizing, setColumnSizing,
    sorting, setSorting,
    density, setDensity,
  } = useTableState("users-table-crud", { _id: false, password: false });

  const { t, i18n } = useTranslation();
  const currentUser = useSelector(selectUser);

  const roles = [
    { label: t(ADMINISTRATOR), value: ADMINISTRATOR },
    { label: t(OFFICER), value: OFFICER },
    { label: t(VISITOR), value: VISITOR },
    ...(currentUser?.role === MAINTAINER
      ? [{ label: t("roles.maintainer"), value: MAINTAINER }]
      : []),
  ];
  const active = [
    { label: t("common.yes"), value: true },
    { label: t("common.no"), value: false },
  ];

  const columns: MRT_ColumnDef<User>[] = [
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
      accessorKey: "email",
      header: t("form.email"),
      enableEditing: true,
      muiEditTextFieldProps: {
        type: "email",
        required: true,
        error: !!validationErrors?.email,
        helperText: validationErrors?.email,
        //remove any previous validation errors when user focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            email: undefined,
          }),
      },
    },
    {
      accessorKey: "role",
      header: t("roles.role"),
      editVariant: "select",
      editSelectOptions: roles,
      Cell: ({ row }) => t(row.original.role),
    },
    {
      accessorKey: "isActive",
      header: t("status.active"),
      editVariant: "select",
      editSelectOptions: active,
      muiEditTextFieldProps: {
        select: true,
      },
      Cell: ({ row }) => isActiveUser(row.original.isActive),
    },
    {
      accessorKey: "isVerified",
      header: t("status.verified"),
      editVariant: "select",
      editSelectOptions: active,
      muiEditTextFieldProps: {
        select: true,
      },
      Cell: ({ row }) => isActiveUser(row.original.isVerified),
    },
    {
      accessorKey: "avatarUrl",
      header: t("common.avatar"),
      enableEditing: true,
    },
    {
      accessorKey: "_id",
      header: "Id",
      enableEditing: false,
    },
    {
      accessorKey: "password",
      header: t("form.password"),
      enableEditing: true,
    },
  ];

  // call CREATE hook
  const {
    mutateAsync: createRow,
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

  //CREATE action
  const handleCreateUser: MRT_TableOptions<User>["onCreatingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createRow(values).catch((error) => console.log(error));
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveUser: MRT_TableOptions<User>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateRow(values).catch((error) => console.log(error));
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<User>) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteRow(row.original._id).catch((error) => console.log(error));
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedData,
    enableColumnResizing: true,
    layoutMode: "grid",
    localization: getLanguage(i18n),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    onDensityChange: setDensity,
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
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t("user.create-new")}</DialogTitle>
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
        <DialogTitle variant="h3">{t("user.edit")}</DialogTitle>
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
        <Tooltip title={t("actions.edit")}>
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("actions.delete")}>
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
        {t("user.create-new")}
      </Button>
    ),
    state: {
      columnVisibility,
      columnSizing,
      sorting,
      density,
      isLoading: isLoadingData,
      isSaving: isUpdatingRow || isDeletingRow,
      showAlertBanner: errorOccuried(),
      showProgressBars: isFetchingData,
    },
  });

  return <MaterialReactTable table={table} />;
};

const queryClient = new QueryClient();

const UsersTableScreenCrudWithProviders = () => (
  //Put this with your other react-query providers near root of your app
  <QueryClientProvider client={queryClient}>
    <UsersTableScreenCrud />
  </QueryClientProvider>
);

export default UsersTableScreenCrudWithProviders;

const validateRequired = (value: string) => !!value.length;
const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

function validateUser(user: User) {
  return {
    name: !validateRequired(user.name) ? "Name is Required" : "",
    email: !validateEmail(user.email) ? "Incorrect Email Format" : "",
  };
}
