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
import { getLanguage } from "../utils/languageSelector";
import { Cemetery } from '../interfaces/CemeteryInterfaces';
import { addCemetery, deleteCemetery, fetchCemeteries, getAllCemeteriesError, getAllCemeteriesStatus, selectAllCemeteries, updateCemetery } from '../features/cemeteriesSlice';
import { selectUser } from '../features/userSlice';

const CemeteriesTableScreenCrud = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { t, i18n } = useTranslation();
  const cemeteries: Cemetery[] = useSelector(selectAllCemeteries);
  const dispatch = useDispatch<any>();
  const cemeteriesStatus = useSelector(getAllCemeteriesStatus);
  const error = useSelector(getAllCemeteriesError);
  const user = useSelector(selectUser);
  useEffect(() => {
    if (cemeteriesStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchCemeteries());
    }
  }, [cemeteriesStatus, dispatch]);

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

  //call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateCemetery(dispatch);
  //call READ hook
  const {
    data: fetchedCemeteries = [],
    isError: isLoadingCemeteriesError,
    isFetching: isFetchingCemeteries,
    isLoading: isLoadingCemeteries,
  } = useGetCemeteries(cemeteries);
  //call UPDATE hook
  const { mutateAsync: updateCemetery, isPending: isUpdatingCemetery } =
    useUpdateCemetery(dispatch);
  //call DELETE hook
  const { mutateAsync: deleteCemetery, isPending: isDeletingCemetery } =
    useDeleteCemetery(dispatch);

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
    await createUser(values);
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
    await updateCemetery(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Cemetery>) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteCemetery(row.original._id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: cemeteries,
    localization: getLanguage(i18n),
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row._id,
    muiToolbarAlertBannerProps: isLoadingCemeteriesError
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
        {t("Create New Cemetery")}
      </Button>
    ),
    state: {
      isLoading: isLoadingCemeteries,
      isSaving: isCreatingUser || isUpdatingCemetery || isDeletingCemetery,
      showAlertBanner: isLoadingCemeteriesError,
      showProgressBars: isFetchingCemeteries,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateCemetery(dispatch: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cemetery: Cemetery) => {
      //send api update request here
      const handleSubmit = async (values: Object) => {
        dispatch(addCemetery(values));
      };
      return handleSubmit({
        name: cemetery.name,
        LAT: cemetery.LAT,
        LON: cemetery.LON,
        zoom: cemetery.zoom,
      });
    },
    //client side optimistic update
    onMutate: (newCemeteryInfo: Cemetery) => {
      queryClient.setQueryData(
        ['cemetery-all'],
        (prevCemeteries: any) =>
          [
            ...prevCemeteries,
            {
              ...newCemeteryInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as Cemetery[],
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get cemeteries from api)
function useGetCemeteries(cemeteries: Cemetery[]) {
  return useQuery<Cemetery[]>({
    queryKey: ['cemetery-all'],
    queryFn: async () => {
      //send api request here 
      return Promise.resolve(cemeteries);
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put cemetery in api)
function useUpdateCemetery(dispatch: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cemetery: Cemetery) => {
      //send api update request here
      const handleSubmit = async (values: Object) => {
        dispatch(updateCemetery(values));
      };
      return handleSubmit({
        id: cemetery._id,
        name: cemetery.name,
        LAT: cemetery.LAT,
        LON: cemetery.LON,
        zoom: cemetery.zoom,
      });
    },
    //client side optimistic update
    onMutate: (newCemeteryInfo: Cemetery) => {
      queryClient.setQueryData(
        ['cemetery-all'],
        (prevCemeteries: any) =>
          prevCemeteries?.map((prevCemetery: Cemetery) =>
            prevCemetery._id === newCemeteryInfo._id ? newCemeteryInfo : prevCemetery,
          ),
      );
    },
    // onSettled: () => queryClient.refetchQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete Cemetery in api)
function useDeleteCemetery(dispatch: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 0)); //fake api call
      // return Promise.resolve();
      const handleSubmit = async (id: string) => {
        dispatch(deleteCemetery(id));
      };
      return handleSubmit(userId);
    },
    //client side optimistic update
    onMutate: (id: string) => {
      queryClient.setQueryData(
        ['cemetery-all'],
        (prevCemetery: any) =>
          prevCemetery?.filter((cemetery: Cemetery) => cemetery._id !== id),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const CemeteriesTableScreenCrudWithProviders = () => (
  //Put this with your other react-query providers near root of your app
  <QueryClientProvider client={queryClient}>
    <CemeteriesTableScreenCrud />
  </QueryClientProvider>
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
