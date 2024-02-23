import { Chip } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
} from "material-react-table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetRows } from "../hooks/useCrudHooks";
import { Deceased } from "../interfaces/GraveIntefaces";
import { dateCalendarFormatter, dateFormatter } from "../utils/dateFormatter";
import { getLanguage } from "../utils/languageSelector";

// Defines the name of the react query
const queryFunction = "deceased-all";

interface MyComponentProps {
  path: string;
  graveCapcity: number;
}

const DeceasedTableComponent: React.FC<MyComponentProps> = (props) => {
  console.log("PATH: ", props.path);
  const [deathDateString, setDeathDateString] = useState("");
  const [birthDateString, setBirthDateString] = useState("");
  const getPath = props.path;
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { t, i18n } = useTranslation();

  const dateOfBirth = (date: string) => {
    return <Chip label={dateFormatter(date)} color="success" />;
  };

  const dateDeath = (date: string) => {
    return <Chip label={dateFormatter(date)} color="error" />;
  };

  const columns: MRT_ColumnDef<Deceased>[] = [
    {
      accessorKey: "_id",
      header: "Id",
      enableEditing: false,
    },
    {
      accessorKey: "name",
      header: t("name"),
    },
    {
      accessorKey: "surname",
      header: t("surname"),
    },
    {
      accessorKey: "cemetery",
      header: t("cemetery"),
    },
    {
      //accessorKey: "dateBirth",
      accessorFn: (row) => dateCalendarFormatter(row.dateBirth),
      id: "dateBirth",
      header: t("dateBirth"),
      enableColumnFilter: false,
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateOfBirth(cell.getValue<string>()),
    },
    {
      accessorFn: (row) => dateCalendarFormatter(row.dateDeath),
      id: "dateDeath",
      header: t("dateDeath"),
      enableColumnFilter: false,
      filterFn: "between",
      filterVariant: "date",
      sortingFn: "datetime",
      Cell: ({ cell }) => dateDeath(cell.getValue<string>()),
    },
  ];

  // call READ hook
  const {
    data: fetchedData = [],
    isError: isLoadingDataError,
    error: loadingDataError,
    isFetching: isFetchingData,
    isLoading: isLoadingData,
    refetch,
  } = useGetRows(queryFunction, getPath);

  useEffect(() => {
    refetch(); // Pozivamo refetch svaki put kada se promeni path
  }, [props.path]);

  function errorOccuried() {
    return isLoadingDataError;
  }

  function errorMessage() {
    return loadingDataError?.message;
  }

  const table = useMaterialReactTable({
    columns,
    data: fetchedData,
    enableColumnResizing: true,
    layoutMode: "grid",
    initialState: { columnVisibility: { _id: false } }, //hide _id column by default
    localization: getLanguage(i18n),
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    getRowId: (row) => row._id,
    muiToolbarAlertBannerProps: errorOccuried()
      ? {
          color: "error",
          children: errorMessage(),
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "100px",
      },
    },
    state: {
      isLoading: isLoadingData,
      showAlertBanner: errorOccuried(),
      showProgressBars: isFetchingData,
    },
  });

  return <MaterialReactTable table={table} />;
};

export default DeceasedTableComponent;
