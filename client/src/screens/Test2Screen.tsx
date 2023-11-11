import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { Grave, GraveData, Deceased } from "../interfaces/GraveIntefaces";
import Chip from "@mui/material/Chip";
import { useTranslation } from "react-i18next";
import { dateFormatter } from "../utils/dateFormatter";

const dateOfBirth = (date: string) => {
  return <Chip label={dateFormatter(date)} color="success" />;
};

const dateDeath = (date: string) => {
  return <Chip label={dateFormatter(date)} color="error" />;
};

const Test2Screen = () => {
  //data and fetching state
  const [data, setData] = useState<Deceased[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  //table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { t, i18n } = useTranslation();

  //if you want to avoid useEffect, look at the React Query example instead
  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      const queryParams = new URLSearchParams();
      queryParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
      queryParams.set("size", `${pagination.pageSize}`);
      queryParams.set("filters", JSON.stringify(columnFilters ?? []));
      queryParams.set("globalFilter", globalFilter ?? "");
      queryParams.set("sorting", JSON.stringify(sorting ?? []));

      try {
        const response = await axios.get(
          `/api/deceased/paginate?${queryParams}`
        );
        const data = response.data;
        console.log(data);
        setData(data?.data);
        setRowCount(data?.totalItems);
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columnFilters, //re-fetch when column filters change
    globalFilter, //re-fetch when global filter changes
    pagination.pageIndex, //re-fetch when page index changes
    pagination.pageSize, //re-fetch when page size changes
    sorting, //re-fetch when sorting changes
  ]);

  const columns = useMemo<MRT_ColumnDef<Deceased>[]>(
    () => [
      {
        accessorKey: "name",
        header: "First Name",
      },
      //column definitions...
      {
        accessorKey: "surname",
        header: "Last Name",
      },
      {
        accessorFn: (row) => new Date(row.dateBirth),
        id: "dateBirth",
        header: t("dateBirth"),
        filterFn: "between",
        filterVariant: "date",
        sortingFn: "datetime",
        Cell: ({ cell }) => dateOfBirth(cell.getValue<string>()),
      },
      {
        accessorFn: (row) => new Date(row.dateDeath),
        id: "dateDeath",
        header: t("dateDeath"),
        filterFn: "between",
        filterVariant: "date",
        sortingFn: "datetime",
        Cell: ({ cell }) => dateDeath(cell.getValue<string>()),
      },

      //end
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: true,
    getRowId: (row) => row._id,
    initialState: { showColumnFilters: true },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  return (
    <>
      <div>
        <h2>Test2</h2>
      </div>
      <MaterialReactTable table={table} />
    </>
  );
};

export default Test2Screen;
