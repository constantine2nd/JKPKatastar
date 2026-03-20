import { Chip } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Deceased } from "../interfaces/GraveIntefaces";
import { dateCalendarFormatter, dateFormatter } from "../utils/dateFormatter";
import { getLanguage } from "../utils/languageSelector";

interface MyComponentProps {
  path: string;
  graveCapcity: number;
  manualPagination?: boolean;
}

const DeceasedTableComponent: React.FC<MyComponentProps> = (props) => {
  const getPath = props.path;
  const isPaginated = props.manualPagination ?? false;

  const { t, i18n } = useTranslation();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  // Reset to first page when the search path changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [getPath]);

  const dateOfBirth = (date: string) => <Chip label={dateFormatter(date)} color="success" />;
  const dateDeath = (date: string) => <Chip label={dateFormatter(date)} color="error" />;

  const columns: MRT_ColumnDef<Deceased>[] = [
    { accessorKey: "_id", header: "Id", enableEditing: false },
    { accessorKey: "name", header: t("form.name") },
    { accessorKey: "surname", header: t("form.surname") },
    { accessorKey: "cemetery", header: t("cemetery.title") },
    {
      accessorFn: (row) => dateCalendarFormatter(row.dateBirth),
      id: "dateBirth",
      header: t("dates.birth"),
      enableColumnFilter: false,
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateOfBirth(cell.getValue<string>()),
    },
    {
      accessorFn: (row) => dateCalendarFormatter(row.dateDeath),
      id: "dateDeath",
      header: t("dates.death"),
      enableColumnFilter: false,
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateDeath(cell.getValue<string>()),
    },
  ];

  const { data: rawData, isError, error, isFetching, isLoading } = useQuery({
    queryKey: isPaginated
      ? ["deceased-search", getPath, pagination.pageIndex, pagination.pageSize]
      : ["deceased-all", getPath],
    queryFn: async () => {
      const url = isPaginated
        ? `${getPath}&start=${pagination.pageIndex * pagination.pageSize}&size=${pagination.pageSize}`
        : getPath;
      const response = await axios.get(url);
      return response.data;
    },
    enabled: !!getPath,
    refetchOnWindowFocus: false,
  });

  const fetchedData: Deceased[] = isPaginated
    ? (rawData as any)?.data ?? []
    : (rawData as any) ?? [];

  const totalRowCount: number | undefined = isPaginated
    ? (rawData as any)?.totalItems ?? 0
    : undefined;

  const table = useMaterialReactTable({
    columns,
    data: fetchedData,
    enableColumnResizing: true,
    layoutMode: "grid",
    manualPagination: isPaginated,
    rowCount: totalRowCount,
    onPaginationChange: isPaginated ? setPagination : undefined,
    initialState: { columnVisibility: { _id: false } },
    localization: getLanguage(i18n),
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    getRowId: (row) => row._id,
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: (error as any)?.message }
      : undefined,
    muiTableContainerProps: { sx: { minHeight: "100px" } },
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
      ...(isPaginated ? { pagination } : {}),
    },
  });

  return <MaterialReactTable table={table} />;
};

export default DeceasedTableComponent;
