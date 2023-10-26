import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
// MUI Table
import { darken } from '@mui/material';
import Loader from "../components/Loader";
import Message from "../components/Message";

import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

import {
  selectAllUsers,
  getAllUsersError,
  getAllUsersStatus,
  getAllUsers,
} from "../features/allUsersSlice";

import { User } from "../interfaces/UserInterfaces";
import { getLanguage } from "../utils/languageSelector";
import i18n from "../i18n";

const UsersTableScreen: React.FC = () => {
  const users: User[] = useSelector(selectAllUsers);
  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: '_id',
        header: 'ID',
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'password',
        header: 'Password',
      },
      {
        accessorKey: 'token',
        header: 'Token',
      },
    ],
    [],
  );
  const usersStatus = useSelector(getAllUsersStatus);
  const error = useSelector(getAllUsersError);
  const dispatch = useDispatch<any>();
  useEffect(() => {
    if (usersStatus === "idle") {
      console.log("UPAO");
      dispatch(getAllUsers());
    }
  }, [usersStatus, dispatch]);

  if (usersStatus === "loading") {
    return <Loader />;
  }

  if (usersStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }


  
  return (
    <>
      <h1>Users table screen</h1>

      <MaterialReactTable 
      columns={columns} 
      data={users} 
      enableRowNumbers
      rowNumberMode="original"  
      localization={getLanguage(i18n)}
      muiTablePaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '0',
          border: '1px dashed #e0e0e0',
        },
      }}
      muiTableBodyProps={{
        sx: (theme) => ({
          '& tr:nth-of-type(odd) > td': {
            backgroundColor: darken(theme.palette.background.default, 0.1),
          },
        }),
      }}
      muiTableHeadCellProps={{
        sx: (theme) => ({
          backgroundColor: darken(theme.palette.background.default, 0.3),
        }),
      }}
      
      />;
    </>
  );
  
};

export default UsersTableScreen;
function createTheme(arg0: { palette: { mode: string; }; }) {
  throw new Error("Function not implemented.");
}

