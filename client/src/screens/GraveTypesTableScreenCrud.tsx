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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getLanguage } from "../utils/languageSelector";
import { GraveType } from "../interfaces/GraveTypeInterfaces";
import { t } from "i18next";

const graveTypeQueryKey = "grave-types-all";

const GraveTypesTableScreenCrud = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { t, i18n } = useTranslation();

  const columns: MRT_ColumnDef<GraveType>[] = [
    {
      accessorKey: "_id",
      header: "Id",
      enableEditing: false,
      size: 80,
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
      accessorKey: "capacity",
      header: t("capacity"),
    },
    {
      accessorKey: "description",
      header: t("description"),
    },
  ];

  // call CREATE hook
  const { mutateAsync: createRow, isPending: isCreatingRow } = useCreateRow();
  // call READ hook
  const {
    data: fetchedData = [],
    isError: isLoadingDataError,
    isFetching: isFetchingData,
    isLoading: isLoadingData,
  } = useGetRows();
  // call UPDATE hook
  const { mutateAsync: updateRow, isPending: isUpdatingRow } = useUpdateRow();
  // call DELETE hook
  const { mutateAsync: deleteRow, isPending: isDeletingRow } = useDeleteRow();

  // CREATE action
  const handleCreateGraveType: MRT_TableOptions<GraveType>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateGraveType(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createRow(values);
      table.setCreatingRow(null); //exit creating mode
    };

  // UPDATE action
  const handleSaveRow: MRT_TableOptions<GraveType>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateGraveType(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateRow(values);
      table.setEditingRow(null); //exit editing mode
    };

  // DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<GraveType>) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
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
    muiToolbarAlertBannerProps: isLoadingDataError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateGraveType,
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
        {t("Create New Grave Type")}
      </Button>
    ),
    state: {
      isLoading: isLoadingData,
      isSaving: isCreatingRow || isUpdatingRow || isDeletingRow,
      showAlertBanner: isLoadingDataError,
      showProgressBars: isFetchingData,
    },
  });

  return <MaterialReactTable table={table} />;
};

// CREATE hook (post a new row to api)
function useCreateRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (row: GraveType) => {
      //send api update request here
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const dataToSend = {
        name: row.name,
        capacity: row.capacity,
        description: row.description,
      };
      const response = await axios.post(
        `/api/grave-types/addgravetype`,
        dataToSend,
        config
      );
      return response.data;
    },
    //client side optimistic update
    onSuccess: (newRowInfo: GraveType) => {
      queryClient.setQueryData(
        [graveTypeQueryKey],
        (prevRows: any) => [...prevRows, { ...newRowInfo }] as GraveType[]
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: [graveTypeQueryKey] }), //refetch users after mutation, disabled for demo
  });
}

// READ hook (get rows from api)
function useGetRows() {
  return useQuery<GraveType[]>({
    queryKey: [graveTypeQueryKey],
    queryFn: async () => {
      // send api request here
      const response = await axios.get(`/api/grave-types/all`);
      return response.data;
    },
    refetchOnWindowFocus: true,
  });
}

// UPDATE hook (put a row in api)
function useUpdateRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (row: GraveType) => {
      //send api update request here
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const dataToSend = {
        id: row._id,
        name: row.name,
        description: row.description,
        capacity: row.capacity,
      };
      const response = await axios.put(
        `/api/grave-types/updategravetype`,
        dataToSend,
        config
      );
      return response.data;
    },
    //client side optimistic update
    onMutate: (newGraveTypeInfo: GraveType) => {
      queryClient.setQueryData([graveTypeQueryKey], (prevRows: any) =>
        prevRows?.map((row: GraveType) =>
          row._id === newGraveTypeInfo._id ? newGraveTypeInfo : row
        )
      );
    },
    // onSettled: () => queryClient.refetchQueries({ queryKey: [graveTypeQueryKey] }), //refetch users after mutation, disabled for demo
  });
}

// DELETE hook (delete a row in api)
function useDeleteRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      //send api update request here
      const response = await axios.delete(`/api/grave-types/${id}`);
      return response.data;
    },
    // client side optimistic update
    onMutate: (id: string) => {
      queryClient.setQueryData([graveTypeQueryKey], (prevRows: any) =>
        prevRows?.filter((row: GraveType) => row._id !== id)
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

const GraveTypesTableScreenCrudWithProviders = () => (
  <GraveTypesTableScreenCrud />
);

export default GraveTypesTableScreenCrudWithProviders;

const validateRequired = (value: string) => !!value.length;

function validateGraveType(row: GraveType) {
  return {
    name: !validateRequired(row.name) ? t("Name is Required") : "",
  };
}
