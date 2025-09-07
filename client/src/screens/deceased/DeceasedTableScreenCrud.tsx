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
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../utils/languageSelector";
import { Deceased, Payer } from "../../interfaces/GraveIntefaces";
import { t } from "i18next";
import {
  useCreateRow,
  useDeleteRow,
  useGetRows,
  useUpdateRow,
} from "../../hooks/useCrudHooks";
import {
  dateFormatter,
  dateCalendarFormatter,
} from "../../utils/dateFormatter";

// Defines the name of the react query
const queryFunction = "deceased-all";
// Defines CRUD paths

interface MyComponentProps {
  graveId: string;
  graveCapcity: number;
}

const DeceasedTableScreenCrud: React.FC<MyComponentProps> = (props) => {
  const [deathDateString, setDeathDateString] = useState("");
  const [birthDateString, setBirthDateString] = useState("");
  const getPath = `/api/deceased/all/${props.graveId}`;
  const createPath = `/api/deceased/adddeceased/${props.graveId}`;
  const updatePath = "/api/deceased/updatedeceased";
  const deletePath = "/api/deceased";
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { t, i18n } = useTranslation();

  const dateOfBirth = (date: string) => {
    return <Chip label={dateFormatter(date)} color="success" />;
  };

  const dateDeath = (date: string) => {
    return <Chip label={dateFormatter(date)} color="error" />;
  };

  const columns: MRT_ColumnDef<Deceased>[] = [
    {
      accessorKey: "_id",
      header: "Id",
      enableEditing: false,
    },
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
      header: t("form.surname"),
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
      //accessorKey: "dateDeath",
      accessorFn: (row) => dateCalendarFormatter(row.dateDeath),
      id: "dateDeath",
      header: t("dates.death"),
      enableColumnFilter: false,
      muiEditTextFieldProps: {
        type: "date",
        required: true,
        error: !!validationErrors?.dateBirth,
        helperText: validationErrors?.dateBirth,
        //remove any previous validation errors when user focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            dateBirth: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateOfBirth(cell.getValue<string>()),
    },
    {
      accessorFn: (row) => dateCalendarFormatter(row.dateDeath),
      id: "dateDeath",
      header: t("dates.death"),
      enableColumnFilter: false,
      muiEditTextFieldProps: {
        type: "date",
        required: true,
        error: !!validationErrors?.dateDeath,
        helperText: validationErrors?.dateDeath,
        //remove any previous validation errors when user focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            dateDeath: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateDeath(cell.getValue<string>()),
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
    console.log("isUpdatingDataError" + isUpdatingDataError);
    return (
      isLoadingDataError ||
      isCreatingDataError ||
      isUpdatingDataError ||
      isUDeletingDataError
    );
  }

  function errorMessage() {
    console.log(updatingDataError);
    return (
      loadingDataError?.message ||
      creatingDataError?.message ||
      updatingDataError?.message ||
      deletingDataError?.message
    );
  }

  // CREATE action
  const handleCreateDeceased: MRT_TableOptions<Deceased>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateDeceased(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createRow(values).catch((error: any) => console.log(error));
      table.setCreatingRow(null); //exit creating mode
    };

  // UPDATE action
  const handleSaveRow: MRT_TableOptions<Deceased>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateDeceased(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateRow(values).catch((error: any) => console.log(error));
    table.setEditingRow(null); //exit editing mode
  };

  // DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Deceased>) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteRow(row.original._id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedData,
    enableColumnResizing: true,
    layoutMode: "grid",
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
        minHeight: "100px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateDeceased,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveRow,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t("deceased.create-new")}</DialogTitle>
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
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => {
      //console.log(table);

      // Ako getElementsByName vrati kolekciju elemenata, možda ćete želeti da pristupite prvom elementu

      const elementsDateBirth = document.getElementsByName("dateBirth");
      const myInput: HTMLInputElement | undefined = Array.from(
        elementsDateBirth,
      )[0] as HTMLInputElement;

      console.log(myInput.value);
      /* const newRow = { ...row };
      newRow._valuesCache = { ...row._valuesCache };
      newRow.original = { ...row.original }; */

      //newRow._valuesCache  = {...row._valuesCache};
      //  console.log(internalEditComponents);
      //   row.original.dateBirth = row.original.dateBirth.split("T")[0];
      //row._valuesCache.dateDeath = row.original.dateDeath.split("T")[0];
      //row._valuesCache.dateBirth = row.original.dateBirth.split("T")[0];
      //  row.original.dateDeath = row.original.dateDeath.split("T")[0];
      /* newRow._valuesCache.dateDeath = row.original.dateDeath.split("T")[0];
      newRow.original.dateDeath = row.original.dateDeath.split("T")[0];
      newRow._valuesCache.dateBirth = row.original.dateBirth.split("T")[0];
      newRow.original.dateBirth = row.original.dateBirth.split("T")[0]; */
      console.log(row);
      // console.log(newRow);
      return (
        <>
          <DialogTitle variant="h3">{t("deceased.edit")}</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {internalEditComponents}{" "}
            {/* or render custom edit components here */}
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </>
      );
    },
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
        disabled={fetchedData.length >= props.graveCapcity}
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
        {t("deceased.create-new")}
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

export default DeceasedTableScreenCrud;

const validateRequired = (value: string) => !!value.length;

function validateDeceased(row: Deceased) {
  return {
    name: !validateRequired(row.name) ? t("Name is Required") : "",
  };
}
