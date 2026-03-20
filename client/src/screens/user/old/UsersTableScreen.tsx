import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Message from "../../../components/Message";
import { getLanguage } from "../../../utils/languageSelector";
import { useTableState } from "../../../hooks/useTableState";
import { isActiveUser } from "../../../components/CommonFuntions";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import {
  selectAllUsers,
  getAllUsersError,
  getAllUsersStatus,
  getAllUsers,
} from "../../../features/allUsersSlice";

import { User } from "../../../interfaces/UserInterfaces";

const UsersTableScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const users: User[] = useSelector(selectAllUsers);
  const usersStatus = useSelector(getAllUsersStatus);
  const error = useSelector(getAllUsersError);
  const dispatch = useDispatch<any>();

  const {
    columnVisibility, setColumnVisibility,
    columnSizing, setColumnSizing,
    sorting, setSorting,
    density, setDensity,
    pagination, setPagination,
  } = useTableState("users-table", { _id: false });

  useEffect(() => {
    if (usersStatus === "idle") {
      dispatch(getAllUsers());
    }
  }, [usersStatus, dispatch]);

  const columns: MRT_ColumnDef<User>[] = [
    {
      accessorKey: "_id",
      header: t("common.id"),
    },
    {
      accessorKey: "name",
      header: t("form.name"),
    },
    {
      accessorKey: "email",
      header: t("form.email"),
    },
    {
      accessorKey: "role",
      header: t("roles.role"),
    },
    {
      accessorKey: "isActive",
      header: t("status.active"),
      Cell: ({ row }) => isActiveUser(row.original.isActive),
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: users,
    enableColumnResizing: true,
    enableStickyHeader: true,
    layoutMode: "semantic",
    localization: getLanguage(i18n),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    onDensityChange: setDensity,
    onPaginationChange: setPagination,
    muiTableContainerProps: {
      sx: {
        height: "calc(100vh - 184px)",
        overflowY: "auto",
      },
    },
    state: {
      columnVisibility,
      columnSizing,
      sorting,
      density,
      pagination,
      isLoading: usersStatus === "loading",
    },
  });

  if (usersStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return <MaterialReactTable table={table} />;
};

export default UsersTableScreen;
