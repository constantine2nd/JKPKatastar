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
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/sr";
import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
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
import { FREE, OCCUPIED, OFFICER, ADMINISTRATOR, MAINTAINER } from "../../utils/constant";

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
  const [showSearch, setShowSearch] = useState(false);
  const [searchCemeteries, setSearchCemeteries] = useState<Cemetery[]>([]);
  const [searchNumber, setSearchNumber] = useState("");
  const [searchField, setSearchField] = useState("");
  const [searchRow, setSearchRow] = useState("");
  const [searchGraveTypeId, setSearchGraveTypeId] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchContractFrom, setSearchContractFrom] = useState<Dayjs | null>(null);
  const [searchContractTo, setSearchContractTo] = useState<Dayjs | null>(null);
  const [searchPayerName, setSearchPayerName] = useState("");
  const [searchPayerSurname, setSearchPayerSurname] = useState("");
  const [appliedSearch, setAppliedSearch] = useState<Record<string, string>>({});
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchCemeteries.length > 0)
      params.cemeteryIds = searchCemeteries.map((c) => c._id).join(",");
    if (searchNumber) params.number = searchNumber;
    if (searchField) params.field = searchField;
    if (searchRow) params.row = searchRow;
    if (searchGraveTypeId) params.graveTypeId = searchGraveTypeId;
    if (searchStatus) params.status = searchStatus;
    if (searchContractFrom) params.contractFrom = searchContractFrom.toISOString();
    if (searchContractTo) params.contractTo = searchContractTo.toISOString();
    if (searchPayerName) params.payerName = searchPayerName;
    if (searchPayerSurname) params.payerSurname = searchPayerSurname;
    setPagination({ ...pagination, pageIndex: 0 });
    setAppliedSearch(params);
  };

  const handleClear = () => {
    setSearchCemeteries([]);
    setSearchNumber("");
    setSearchField("");
    setSearchRow("");
    setSearchGraveTypeId("");
    setSearchStatus("");
    setSearchContractFrom(null);
    setSearchContractTo(null);
    setSearchPayerName("");
    setSearchPayerSurname("");
    setPagination({ ...pagination, pageIndex: 0 });
    setAppliedSearch({});
  };

  // call READ hook (server-side paginated)
  const {
    data: pagedResult,
    isError: isLoadingDataError,
    error: loadingDataError,
    isFetching: isFetchingData,
    isLoading: isLoadingData,
  } = useQuery({
    queryKey: [queryFunction, pagination.pageIndex, pagination.pageSize, appliedSearch],
    queryFn: async () => {
      const start = pagination.pageIndex * pagination.pageSize;
      const params = new URLSearchParams({
        start: String(start),
        size: String(pagination.pageSize),
        ...appliedSearch,
      });
      const response = await axios.get(`/api/graves/paginate?${params}`);
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
        // + ~340px search form when open
        height: showSearch ? "calc(100vh - 524px)" : "calc(100vh - 184px)",
        minHeight: "200px",
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
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant={showSearch ? "contained" : "outlined"}
          startIcon={<SearchIcon />}
          onClick={() => setShowSearch((prev) => !prev)}
        >
          {t("search-deceased.search")}
        </Button>
        {(user?.role === OFFICER || user?.role === ADMINISTRATOR || user?.role === MAINTAINER) && (
          <Button
            variant="contained"
            onClick={() => {
              const url = "/add-grave";
              window.open(url, "_blank");
            }}
          >
            {t("grave.add")}
          </Button>
        )}
      </Box>
    ),
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
      <Collapse in={showSearch}>
        <Paper elevation={2} sx={{ p: 2, mb: 0 }}>
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  value={searchCemeteries}
                  onChange={(_, value) => setSearchCemeteries(value)}
                  options={cemeteries}
                  getOptionLabel={(option) => option.name}
                  disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...(params as any)}
                      label={t("cemetery.title") as string}
                      placeholder={t("cemetery.selection") as string}
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <MenuItem
                      {...props}
                      key={option._id}
                      value={option._id}
                      sx={{ justifyContent: "space-between" }}
                    >
                      {option.name}
                      {selected ? <CheckIcon color="info" /> : null}
                    </MenuItem>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label={t("grave.number")}
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label={t("grave.field")}
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label={t("grave.row")}
                  value={searchRow}
                  onChange={(e) => setSearchRow(e.target.value)}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label={t("grave-type.title")}
                  value={searchGraveTypeId}
                  onChange={(e) => setSearchGraveTypeId(e.target.value)}
                >
                  <MenuItem value=""><em>—</em></MenuItem>
                  {myGraveTypes.map((gt) => (
                    <MenuItem key={gt.value} value={gt.value}>{gt.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label={t("status.status")}
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                >
                  <MenuItem value=""><em>—</em></MenuItem>
                  {statuses.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label={t("search-graves.contract-from")}
                  value={searchContractFrom}
                  onChange={(val) => setSearchContractFrom(val)}
                  format="DD.MM.YYYY"
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label={t("search-graves.contract-to")}
                  value={searchContractTo}
                  onChange={(val) => setSearchContractTo(val)}
                  format="DD.MM.YYYY"
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              {(user?.role === OFFICER || user?.role === ADMINISTRATOR || user?.role === MAINTAINER) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("payer.name")}
                      value={searchPayerName}
                      onChange={(e) => setSearchPayerName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("payer.surname")}
                      value={searchPayerSurname}
                      onChange={(e) => setSearchPayerSurname(e.target.value)}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={6}>
                <Button type="submit" variant="contained" fullWidth>
                  {t("search-deceased.search")}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" fullWidth onClick={handleClear}>
                  {t("search-graves.clear")}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Collapse>
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
