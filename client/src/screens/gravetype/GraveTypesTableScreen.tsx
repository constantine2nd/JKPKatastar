import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { getLanguage } from "../../utils/languageSelector";
import { useTableState } from "../../hooks/useTableState";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import {
  getAllGraveTypes,
  selectAllGraveTypes,
  getAllGraveTypesStatus,
  getAllGraveTypesError,
} from "../../features/graveTypesSlice";

import { GraveType } from "../../interfaces/GraveTypeInterfaces";

const GraveTypesTableScreen: React.FC = () => {
  const graveTypes: GraveType[] | null = useSelector(selectAllGraveTypes);
  const graveTypesStatus = useSelector(getAllGraveTypesStatus);
  const error = useSelector(getAllGraveTypesError);
  const dispatch = useDispatch<any>();
  const { t, i18n } = useTranslation();

  const {
    columnVisibility, setColumnVisibility,
    columnSizing, setColumnSizing,
    sorting, setSorting,
    density, setDensity,
    pagination, setPagination,
  } = useTableState("grave-types-table");

  useEffect(() => {
    if (graveTypesStatus === "idle") {
      dispatch(getAllGraveTypes());
    }
  }, [graveTypesStatus, dispatch]);

  const columns: MRT_ColumnDef<GraveType>[] = [
    {
      accessorKey: "_id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: t("form.name"),
    },
    {
      accessorKey: "capacity",
      header: t("grave.capacity"),
    },
    {
      accessorKey: "description",
      header: t("common.description"),
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: graveTypes ?? [],
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
      isLoading: graveTypesStatus === "loading",
    },
  });

  if (graveTypesStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return <MaterialReactTable table={table} />;
};

export default GraveTypesTableScreen;
