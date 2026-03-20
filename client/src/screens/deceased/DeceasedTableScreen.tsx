import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { createSearchParams, useNavigate } from "react-router-dom";

import ButtonMUI from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  fetchDeceased,
  getDeceasedError,
  getDeceasedStatus,
  selectAllDeceased,
} from "../../features/deceasedSlice";
import { Deceased } from "../../interfaces/GraveIntefaces";
import { dateFormatter } from "../../utils/dateFormatter.js";
import { getLanguage } from "../../utils/languageSelector.js";
import { useTableState } from "../../hooks/useTableState";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

const dateOfBirth = (date: string) => (
  <Chip label={dateFormatter(date)} color="success" />
);

const dateDeath = (date: string) => (
  <Chip label={dateFormatter(date)} color="error" />
);

const DeceasedTableScreen: React.FC = () => {
  const navigate = useNavigate();
  const deceased: Deceased[] = useSelector(selectAllDeceased);
  const gravesStatus = useSelector(getDeceasedStatus);
  const error = useSelector(getDeceasedError);
  const dispatch = useDispatch<any>();
  const { t, i18n } = useTranslation();

  const {
    columnVisibility, setColumnVisibility,
    columnSizing, setColumnSizing,
    sorting, setSorting,
    density, setDensity,
    pagination, setPagination,
  } = useTableState("deceased-table");

  useEffect(() => {
    if (gravesStatus === "idle") {
      dispatch(fetchDeceased());
    }
  }, [gravesStatus, dispatch]);

  const columns: MRT_ColumnDef<Deceased>[] = [
    {
      accessorKey: "name",
      header: t("form.name"),
    },
    {
      accessorKey: "surname",
      header: t("form.surname"),
    },
    {
      accessorFn: (row) => new Date(row.dateBirth),
      id: "dateBirth",
      header: t("dates.birth"),
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateOfBirth(cell.getValue<string>()),
    },
    {
      accessorFn: (row) => new Date(row.dateDeath),
      id: "dateDeath",
      header: t("dates.death"),
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateDeath(cell.getValue<string>()),
    },
    {
      accessorKey: "grave.field",
      header: t("grave.field"),
    },
    {
      accessorKey: "grave.row",
      header: t("grave.row"),
    },
    {
      accessorKey: "grave.number",
      header: t("grave.number"),
    },
    {
      accessorKey: "grave.cemetery.name",
      header: t("cemetery.title"),
    },
    {
      accessorKey: "grave.graveType.name",
      header: t("grave-type.title"),
    },
    {
      accessorKey: "grave._id",
      header: "",
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <ButtonMUI
          variant="contained"
          onClick={() => {
            navigate({
              pathname: "/single-grave",
              search: createSearchParams({
                id: row.getValue<string>("grave._id"),
              }).toString(),
            });
          }}
        >
          {t("common.details")}
        </ButtonMUI>
      ),
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: deceased,
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
      isLoading: gravesStatus === "loading",
    },
  });

  if (gravesStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return <MaterialReactTable table={table} />;
};

export default DeceasedTableScreen;
