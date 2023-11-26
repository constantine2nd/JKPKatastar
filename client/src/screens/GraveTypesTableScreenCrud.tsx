import { useEffect, useState } from 'react';
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
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { getLanguage } from "../utils/languageSelector";
import { GraveType } from '../interfaces/GraveTypeInterfaces';
import { 
  addGraveType,
  deleteGraveType,
  getAllGraveTypes, 
  getAllGraveTypesError, 
  getAllGraveTypesStatus, 
  selectAllGraveTypes, 
  updateGraveType 
} from '../features/graveTypesSlice';

const GraveTypesTableScreenCrud = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { t, i18n } = useTranslation();
  const graveTypes: GraveType[] = useSelector(selectAllGraveTypes);
  const dispatch = useDispatch<any>();
  const graveTypesStatus = useSelector(getAllGraveTypesStatus);
  const error = useSelector(getAllGraveTypesError);
  useEffect(() => {
    if (graveTypesStatus === "idle") {
      console.log("UPAO");
      dispatch(getAllGraveTypes());
    }
  }, [graveTypesStatus, dispatch]);

  const columns: MRT_ColumnDef<GraveType>[] = [
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
        accessorKey: 'capacity',
        header: t('capacity'),
      },
      {
        accessorKey: 'description',
        header: t('description'),
      },
    ];

  //call CREATE hook
  const { mutateAsync: createGraveType, isPending: isCreatingGraveType } =
    useGraveType(dispatch);
  //call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingGraveTypesError,
    isFetching: isFetchingGraveTypes,
    isLoading: isLoadingGraveTypes,
  } = useGetGraveTypes(graveTypes);
  //call UPDATE hook
  const { mutateAsync: updateGraveType, isPending: isUpdatingGraveType } =
    useUpdateGraveType(dispatch);
  //call DELETE hook
  const { mutateAsync: deleteGraveType, isPending: isDeletingGraveType } =
    useDeleteGraveType(dispatch);

  //CREATE action
  const handleCreateGraveType: MRT_TableOptions<GraveType>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateGraveType(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createGraveType(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveUser: MRT_TableOptions<GraveType>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateGraveType(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateGraveType(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<GraveType>) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteGraveType(row.original._id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: graveTypes,
    localization: getLanguage(i18n),
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row._id,
    muiToolbarAlertBannerProps: isLoadingGraveTypesError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateGraveType,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t("Create New Grave Type")}</DialogTitle>
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
        <DialogTitle variant="h3">{t("Edit Grave Type")}</DialogTitle>
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
      isLoading: isLoadingGraveTypes,
      isSaving: isCreatingGraveType || isUpdatingGraveType || isDeletingGraveType,
      showAlertBanner: isLoadingGraveTypesError,
      showProgressBars: isFetchingGraveTypes,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useGraveType(dispatch: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (graveType: GraveType) => {
      //send api update request here
      const handleSubmit = async (values: Object) => {
        dispatch(addGraveType(values));
      };
      return handleSubmit({
        name: graveType.name,
        capacity: graveType.capacity,
        description: graveType.description,
      });
    },
    //client side optimistic update
    onMutate: (newGraveTypeInfo: GraveType) => {
      queryClient.setQueryData(
        ['grave-types-all'],
        (prevGraveType: any) =>
          [
            ...prevGraveType,
            {
              ...newGraveTypeInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as GraveType[],
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get grave types from api)
function useGetGraveTypes(graveTypes: GraveType[]) {
  return useQuery<GraveType[]>({
    queryKey: ['grave-types-all'],
    queryFn: async () => {
      //send api request here 
      return Promise.resolve(graveTypes);
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put user in api)
function useUpdateGraveType(dispatch: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (graveType: GraveType) => {
      //send api update request here
      const handleSubmit = async (values: Object) => {
        dispatch(updateGraveType(values));
      };
      return handleSubmit({
        id: graveType._id,
        name: graveType.name,
        description: graveType.description,
        capacity: graveType.capacity,
      });
    },
    //client side optimistic update
    onMutate: (newGraveTypeInfo: GraveType) => {
      queryClient.setQueryData(
        ['grave-types-all'],
        (prevRows: any) =>
          prevRows?.map((row: GraveType) =>
            row._id === newGraveTypeInfo._id ? newGraveTypeInfo : row,
          ),
      );
    },
    // onSettled: () => queryClient.refetchQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete grave type in api)
function useDeleteGraveType(dispatch: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (graveTypeId: string) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 0)); //fake api call
      // return Promise.resolve();
      const handleSubmit = async (id: string) => {
        dispatch(deleteGraveType(id));
      };
      return handleSubmit(graveTypeId);
    },
    //client side optimistic update
    onMutate: (graveTypeId: string) => {
      queryClient.setQueryData(
        ['grave-types-all'],
        (prevRows: any) =>
          prevRows?.filter((row: GraveType) => row._id !== graveTypeId),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const GraveTypesTableScreenCrudWithProviders = () => (
  //Put this with your other react-query providers near root of your app
  <QueryClientProvider client={queryClient}>
    <GraveTypesTableScreenCrud />
  </QueryClientProvider>
);

export default GraveTypesTableScreenCrudWithProviders;

const validateRequired = (value: string) => !!value.length;

function validateGraveType(graveType: GraveType) {
  return {
    name: !validateRequired(graveType.name) ? 'Name is Required' : '',
  };
}
