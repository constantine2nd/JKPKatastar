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
import { User } from "../interfaces/UserInterfaces";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { updateUser, deleteUser, getAllUsers, getAllUsersStatus, getAllUsersError, selectAllUsers } from '../features/allUsersSlice';
import axios from 'axios';
import { getLanguage } from "../utils/languageSelector";
import { isActiveUser } from "../components/IsActiveUser"
//Import Material React Table Translations
import { MRT_Localization_ES } from 'material-react-table/locales/es';

const UsersTableScreenCrud = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { t, i18n } = useTranslation();
  const users: User[] = useSelector(selectAllUsers);
  const dispatch = useDispatch<any>();
  const usersStatus = useSelector(getAllUsersStatus);
  const error = useSelector(getAllUsersError);
  useEffect(() => {
    if (usersStatus === "idle") {
      console.log("UPAO");
      dispatch(getAllUsers());
    }
  }, [usersStatus, dispatch]);

  const roles = [
    'ADMIN',
    'SUPER_ADMIN',
    'USER',
  ] 
  const active = [
    { label: t('yes'), value: true },
    { label: t('no'), value: false },
  ]

  const columns: MRT_ColumnDef<User>[] = [
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
          type: 'email',
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
        accessorKey: 'email',
        header: t('email'),
        enableEditing: false,
        muiEditTextFieldProps: {
          type: 'email',
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
        accessorKey: 'role',
        header: t('role'),
        editVariant: 'select',
        editSelectOptions: roles,
      },
      {
        accessorKey: 'isActive',
        header: t('Active'),
        editVariant: 'select',
        editSelectOptions: active,
        muiEditTextFieldProps: {
          select: true,
        },
        Cell: ({ row }) => (
          isActiveUser(row.original.isActive, t)
        ),
      },
    ];

  //call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  //call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers(users);
  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser(dispatch);
  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser(dispatch);

  //CREATE action
  const handleCreateUser: MRT_TableOptions<User>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveUser: MRT_TableOptions<User>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<User>) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(row.original._id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: users,
    localization: getLanguage(i18n),
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row._id,
    muiToolbarAlertBannerProps: isLoadingUsersError
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
    onEditingRowSave: handleSaveUser,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Create New User</DialogTitle>
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
        <DialogTitle variant="h3">Edit User</DialogTitle>
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
        {t("Create New User")}
      </Button>
    ),
    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newUserInfo: User) => {
      queryClient.setQueryData(
        ['users-all'],
        (prevUsers: any) =>
          [
            ...prevUsers,
            {
              ...newUserInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as User[],
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get users from api)
function useGetUsers(users: User[]) {
  return useQuery<User[]>({
    queryKey: ['users-all'],
    queryFn: async () => {
      //send api request here 
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve(users);
      // const response = await axios.get(`/api/users`);
      // console.log(response)
      // return Promise.resolve(response.data);
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put user in api)
function useUpdateUser(dispatch: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      //send api update request here
      // await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      // return Promise.resolve();
      const handleSubmit = async (values: Object) => {
        dispatch(updateUser(values));
      };
      return handleSubmit({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    },
    //client side optimistic update
    onMutate: (newUserInfo: User) => {
      queryClient.setQueryData(
        ['users-all'],
        (prevUsers: any) =>
          prevUsers?.map((prevUser: User) =>
            prevUser._id === newUserInfo._id ? newUserInfo : prevUser,
          ),
      );
    },
    // onSettled: () => queryClient.refetchQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeleteUser(dispatch: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 0)); //fake api call
      // return Promise.resolve();
      const handleSubmit = async (id: string) => {
        dispatch(deleteUser(id));
      };
      return handleSubmit(userId);
    },
    //client side optimistic update
    onMutate: (userId: string) => {
      queryClient.setQueryData(
        ['users-all'],
        (prevUsers: any) =>
          prevUsers?.filter((user: User) => user._id !== userId),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users-all'] }), //refetch users after mutation, disabled for demo
  });
}

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
    name: !validateRequired(user.name) ? 'Name is Required' : '',
    email: !validateEmail(user.email) ? 'Incorrect Email Format' : '',
  };
}
