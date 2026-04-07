import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { expiredContract } from "../../components/CommonFuntions";

interface Payer {
  name: string;
  surname: string;
  phone: string;
}

interface GraveInReport {
  _id: string;
  number: number;
  field: number;
  row: number;
  contractTo: string;
  status: string;
  cemetery: { _id: string; name: string };
  graveType: { _id: string; name: string };
  activePayer?: Payer;
}

interface ReportData {
  generatedAt: string;
  summary: {
    expired: number;
    within30days: number;
    within60days: number;
    within90days: number;
  };
  expired: GraveInReport[];
  within30days: GraveInReport[];
  within60days: GraveInReport[];
  within90days: GraveInReport[];
}

const ContractExpiryReportScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<ReportData>({
    queryKey: ["contract-expiry-report"],
    queryFn: async () => {
      const res = await axios.get("/api/graves/contract-expiry-report");
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const columns = useMemo<MRT_ColumnDef<GraveInReport>[]>(
    () => [
      {
        accessorKey: "cemetery.name",
        header: t("cemetery.title"),
        size: 140,
      },
      {
        accessorKey: "number",
        header: t("grave.number"),
        size: 80,
      },
      {
        accessorKey: "field",
        header: t("grave.field"),
        size: 70,
      },
      {
        accessorKey: "row",
        header: t("grave.row"),
        size: 70,
      },
      {
        accessorKey: "graveType.name",
        header: t("grave.type"),
        size: 120,
      },
      {
        accessorKey: "contractTo",
        header: t("grave.contract-expiration-date"),
        size: 180,
        Cell: ({ cell }) => expiredContract(cell.getValue<string>()),
      },
      {
        accessorKey: "activePayer",
        header: t("report.active-payer"),
        size: 200,
        Cell: ({ cell }) => {
          const payer = cell.getValue<Payer | undefined>();
          if (!payer) return <Typography variant="body2" color="text.secondary">—</Typography>;
          return (
            <Box>
              <Typography variant="body2">{payer.surname} {payer.name}</Typography>
              {payer.phone && (
                <Typography variant="caption" color="text.secondary">{payer.phone}</Typography>
              )}
            </Box>
          );
        },
        enableSorting: false,
      },
    ],
    [t],
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <Typography color="error">{t("common.error")}</Typography>
      </Box>
    );
  }

  const sections = [
    {
      key: "expired",
      label: t("report.expired"),
      rows: data.expired,
      color: "error" as const,
    },
    {
      key: "within30days",
      label: t("report.within-30"),
      rows: data.within30days,
      color: "warning" as const,
    },
    {
      key: "within60days",
      label: t("report.within-60"),
      rows: data.within60days,
      color: "warning" as const,
    },
    {
      key: "within90days",
      label: t("report.within-90"),
      rows: data.within90days,
      color: "info" as const,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t("report.contract-expiry-title")}
      </Typography>

      {/* Summary row */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <Paper sx={{ p: 2, minWidth: 140, textAlign: "center" }}>
          <Typography variant="h4" color="error.main">{data.summary.expired}</Typography>
          <Typography variant="body2">{t("report.expired")}</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 140, textAlign: "center" }}>
          <Typography variant="h4" color="warning.main">{data.summary.within30days}</Typography>
          <Typography variant="body2">{t("report.within-30")}</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 140, textAlign: "center" }}>
          <Typography variant="h4" color="warning.main">{data.summary.within60days}</Typography>
          <Typography variant="body2">{t("report.within-60")}</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 140, textAlign: "center" }}>
          <Typography variant="h4" color="info.main">{data.summary.within90days}</Typography>
          <Typography variant="body2">{t("report.within-90")}</Typography>
        </Paper>
      </Box>

      {/* Sections */}
      {sections.map((section) => (
        <Accordion key={section.key} defaultExpanded={section.rows.length > 0} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography fontWeight={600}>{section.label}</Typography>
              <Chip label={section.rows.length} color={section.color} size="small" />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {section.rows.length === 0 ? (
              <Box p={2}>
                <Typography variant="body2" color="text.secondary">
                  {t("report.no-records")}
                </Typography>
              </Box>
            ) : (
              <SectionTable columns={columns} rows={section.rows} navigate={navigate} t={t} />
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

// Separate component so each table gets its own hook call (Rules of Hooks)
const SectionTable = ({
  columns,
  rows,
  navigate,
  t,
}: {
  columns: MRT_ColumnDef<GraveInReport>[];
  rows: GraveInReport[];
  navigate: ReturnType<typeof useNavigate>;
  t: (key: string) => string;
}) => {
  const table = useMaterialReactTable({
    columns,
    data: rows,
    enableEditing: false,
    enableColumnActions: false,
    enableTopToolbar: false,
    enableBottomToolbar: rows.length > 10,
    initialState: { density: "compact" },
    enableRowActions: true,
    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": { size: 50, header: "" },
    },
    renderRowActions: ({ row }) => (
      <Tooltip title={t("actions.open")}>
        <IconButton
          size="small"
          onClick={() => navigate(`/single-grave?id=${row.original._id}`)}
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default ContractExpiryReportScreen;
