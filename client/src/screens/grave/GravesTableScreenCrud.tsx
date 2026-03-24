import { useState, useEffect } from "react";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/sr";
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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../utils/languageSelector";
import { t } from "i18next";
import {
  useCreateRow,
  useDeleteRow,
  useUpdateRow,
} from "../../hooks/useCrudHooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
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
import { selectUser } from "../../features/userSlice";
import {
  fetchCemeteries,
  selectAllCemeteries,
} from "../../features/cemeteriesSlice";
import { GraveType } from "../../interfaces/GraveTypeInterfaces";
import { Cemetery } from "../../interfaces/CemeteryInterfaces";
import { FREE, OCCUPIED, OFFICER, ADMINISTRATOR } from "../../utils/constant";

// Defines the name of the react query
const queryFunction = "graves-paginated";
// Defines CRUD paths
const createPath = "/api/graves/addgraverequest";
const updatePath = "/api/graves/updategrave";
const deletePath = "/api/graves/single";

const GravesTableScreenCrud = () => {
  const [open, setOpen] = useState(false);
  const [idOfrowToDelete, setIdOfRowToDelete] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const {
    pagination, setPagination,
    columnVisibility, setColumnVisibility,
    columnSizing, setColumnSizing,
    sorting, setSorting,
    density, setDensity,
  } = useTableState("graves-table-crud");
  const queryClient = useQueryClient();
  const graveTypes: GraveType[] | null = useSelector(selectAllGraveTypes);
  const cemeteries: Cemetery[] | null = useSelector(selectAllCemeteries);
  const user = useSelector(selectUser);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  useEffect(() => {
    dispatch(getAllGraveTypes());
    dispatch(fetchCemeteries());
  }, []);
  const statuses = [
    { label: t("status.free"), value: FREE },
    { label: t("status.occupied"), value: OCCUPIED },
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
      accessorKey: "cemetery._id",
      header: t("cemetery.title"),
      editVariant: "select",
      editSelectOptions: myCemeteries,
      enableEditing: true,
      Cell: ({ row }) =>
        cemeteries.find((item) => item._id === row.original.cemetery?._id)?.name,
    },
    {
      accessorKey: "number",
      header: t("grave.number"),
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
      header: t("grave.field"),
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
      header: t("grave.row"),
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
      header: t("grave-type.title"),
      editVariant: "select",
      editSelectOptions: myGraveTypes,
      enableEditing: true,
      Cell: ({ row }) =>
        graveTypes.find((item) => item._id === row.original.graveType?._id)
          ?.name,
    },
    {
      accessorKey: "_id",
      header: "Id",
      enableEditing: false,
    },
    {
      accessorFn: (row) => {
        if (!row.contractTo) return "";
        const d = new Date(row.contractTo);
        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
      },
      id: "contractTo",
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      header: t("grave.contract-expiration-date"),
      Cell: ({ row }) => expiredContract(row.original.contractTo),
      enableEditing: true,
      Edit: ({ row, column, table }) => {
        const rawValue = row._valuesCache[column.id] as string;
        return (
          <DatePicker
            label={t("grave.contract-expiration-date")}
            value={rawValue ? dayjs(rawValue) : null}
            onChange={(newValue) => {
              row._valuesCache[column.id] = newValue
                ? newValue.format("YYYY-MM-DD")
                : "";
              table.setEditingRow({ ...row });
            }}
            format="DD.MM.YYYY"
            dayOfWeekFormatter={(dayOfWeek) => dayOfWeek}
            slotProps={{
              textField: {
                variant: "standard",
                fullWidth: true,
              },
            }}
          />
        );
      },
    },
    {
      accessorFn: (row) => {
        console.log(row);
        return `${row.numberOfDeceaseds ?? 0}/${row.graveType?.capacity ?? 0}`;
      }, //accessorFn used to join multiple data into a single cell
      id: "occupation",
      header: t("grave.occupation"),
      enableEditing: false,
      Cell: ({ renderedCellValue, row }) =>
        capacityExt(row.getValue("occupation")),
    },
    {
      accessorKey: "status",
      header: t("status.status"),
      editVariant: "select",
      editSelectOptions: statuses,
      Cell: ({ row }) => statusOfGrave(row.original.status),
    },
  ];

  // call READ hook (server-side paginated)
  const {
    data: pagedResult,
    isError: isLoadingDataError,
    error: loadingDataError,
    isFetching: isFetchingData,
    isLoading: isLoadingData,
  } = useQuery({
    queryKey: [queryFunction, pagination.pageIndex, pagination.pageSize],
    queryFn: async () => {
      const start = pagination.pageIndex * pagination.pageSize;
      const response = await axios.get(
        `/api/graves/paginate?start=${start}&size=${pagination.pageSize}`
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
  const fetchedData = pagedResult?.data ?? [];
  const totalRowCount = pagedResult?.totalItems ?? 0;
  // call UPDATE hook
  const {
    mutateAsync: updateRow,
    isPending: isUpdatingRow,
    isError: isUpdatingDataError,
    error: updatingDataError,
  } = useUpdateRow(queryFunction, updatePath, () =>
    queryClient.invalidateQueries({ queryKey: [queryFunction] })
  );
  // call DELETE hook
  const {
    mutateAsync: deleteRow,
    isPending: isDeletingRow,
    isError: isUDeletingDataError,
    error: deletingDataError,
  } = useDeleteRow(queryFunction, deletePath, () =>
    queryClient.invalidateQueries({ queryKey: [queryFunction] })
  );


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
    enableStickyHeader: true,
    layoutMode: "semantic",
    manualPagination: true,
    rowCount: totalRowCount,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    onDensityChange: setDensity,
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
        // 64px AppBar + 64px MRT top toolbar + 56px MRT bottom toolbar/pagination
        height: "calc(100vh - 184px)",
        overflowY: "auto",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveRow,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t("grave-type.create-new")}</DialogTitle>
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
        <DialogTitle variant="h3">{t("grave-type.edit")}</DialogTitle>
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
        <Tooltip title={t("actions.open")}>
          <IconButton onClick={() => navigate(`/single-grave?id=${row.original._id}`)}>
            <OpenInNewIcon />
          </IconButton>
        </Tooltip>
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
    renderTopToolbarCustomActions: () =>
      user?.role === OFFICER || user?.role === ADMINISTRATOR ? (
        <Button
          variant="contained"
          onClick={() => {
            const url = "/add-grave";
            window.open(url, "_blank");
          }}
        >
          {t("grave.add")}
        </Button>
      ) : null,
    state: {
      pagination,
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
      ? t("client.err-field-required")
      : "",
    field: !validateRequired(tableRow.field)
      ? t("client.err-field-required")
      : "",
    row: !validateRequired(tableRow.row) ? t("client.err-field-required") : "",
  };
}
