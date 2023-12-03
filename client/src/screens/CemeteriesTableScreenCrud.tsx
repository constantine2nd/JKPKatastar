import { useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../utils/languageSelector";
import { Cemetery } from '../interfaces/CemeteryInterfaces';
import { selectUser } from '../features/userSlice';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { jsPDF } from 'jspdf'; //or use your library of choice here
import autoTable from 'jspdf-autotable';
import '../fonts/Roboto-Regular-normal'
import {
  useCreateRow,
  useDeleteRow,
  useGetRows,
  useUpdateRow,
} from "../hooks/useCrudHooks";

// Defines the name of the react query
const queryFunction = "grave-types-all";
// Defines CRUD paths
const getPath = "/api/cemeteries";
const createPath = `/api/cemeteries/addcemetery`;
const updatePath = "/api/cemeteries/updatecemetery";
const deletePath = "/api/cemeteries";

const CemeteriesTableScreenCrud = () => {

  const handleExportRows = (rows: MRT_Row<Cemetery>[]) => {
    const doc = new jsPDF();
    doc.setFont("Roboto-Regular", "normal");
    const tableData = rows.map((row) => Object.values(row.original));
    const tableHeaders = columns.map((c) => c.header);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: {
        font: 'Roboto-Regular',
        fontStyle: 'normal',
      }
    });

    doc.save('cemeteries.pdf');
  };

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { t, i18n } = useTranslation();
  const user = useSelector(selectUser);

  const columns: MRT_ColumnDef<Cemetery>[] = [
      {
        accessorKey: '_id',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'name',
        header: t('name'),
        muiEditTextFieldProps: {
          type: 'text',
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
        accessorKey: 'LAT',
        header: t('LAT'),
        muiEditTextFieldProps: {
          type: 'text',
          required: true,
          error: !!validationErrors?.LAT,
          helperText: validationErrors?.LAT,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              LAT: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: 'LON',
        header: t('LON'),
        muiEditTextFieldProps: {
          type: 'text',
          required: true,
          error: !!validationErrors?.LON,
          helperText: validationErrors?.LON,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              LON: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: 'zoom',
        header: t('Zoom'),
        muiEditTextFieldProps: {
          type: 'text',
          required: true,
          error: !!validationErrors?.zoom,
          helperText: validationErrors?.zoom,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              zoom: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      }
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

  //CREATE action
  const handleCreateUser: MRT_TableOptions<Cemetery>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateCemetery(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createRow(values).catch((error) => console.log(error));
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveCemetery: MRT_TableOptions<Cemetery>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateCemetery(values);
    console.log(newValidationErrors)
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateRow(values).catch((error) => console.log(error));
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Cemetery>) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteRow(row.original._id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedData,
    localization: getLanguage(i18n),
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row._id,
    muiToolbarAlertBannerProps: errorOccuried()
      ? {
          color: 'error',
          children: errorMessage(),
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCemetery,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t("Create New Cemetery")}</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions >
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t("Edit Cemetery")}</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title={t("Edit")}>
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {(user?.role === "SUPER_ADMIN") && (
            <Tooltip title={t("Delete")}>
              <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <>
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
        }}

      >
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          //export all rows, including from the next page, (still respects filtering and sorting)
          onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export All Rows
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Page Rows
        </Button>
        <Button
          disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Selected Rows
        </Button>
      </Box>
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
        } }
      >
          {t("Create New Cemetery")}
        </Button>
      </>
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

const CemeteriesTableScreenCrudWithProviders = () => (
  <CemeteriesTableScreenCrud />
);

export default CemeteriesTableScreenCrudWithProviders;

const validateRequired = (value: string) => !!value.length;

function validateCemetery(cemetery: Cemetery) {
  return {
    name: !validateRequired(cemetery.name) ? 'Name is Required' : '',
    zoom: !validateRequired(cemetery.zoom.toString()) ? 'Zoom is Required' : '',
    LAT: !validateRequired(cemetery.LAT.toString()) ? 'LAT is Required' : '',
    LON: !validateRequired(cemetery.LON.toString()) ? 'LON is Required' : '',
  };
}
