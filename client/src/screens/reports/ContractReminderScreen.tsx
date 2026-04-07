import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import SmsIcon from "@mui/icons-material/Sms";
import PhoneIcon from "@mui/icons-material/Phone";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import { expiredContract } from "../../components/CommonFuntions";
import { dateFormatter } from "../../utils/dateFormatter";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ReportPayer {
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
  cemetery: { _id: string; name: string };
  graveType: { _id: string; name: string };
  activePayer?: ReportPayer;
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

interface SingleGrave {
  _id: string;
  number: number;
  field: number;
  row: number;
  status: string;
  contractTo: string;
  capacity: number;
  graveType: { name: string };
  cemetery: { name: string };
  deceased: { _id: string; name: string; surname: string; dateBirth: string; dateDeath: string }[];
  payers: { _id: string; name: string; surname: string; phone: string; jmbg: string; active: boolean }[];
}

type BucketKey = "all" | "expired" | "within30days" | "within60days" | "within90days";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildSmsBody = (grave: GraveInReport, t: (k: string, opts?: object) => string) => {
  const payerName = grave.activePayer
    ? `${grave.activePayer.surname} ${grave.activePayer.name}`
    : "";
  const date = grave.contractTo ? dateFormatter(grave.contractTo) : "—";
  return t("reminder.sms-body", {
    payerName,
    graveNumber: grave.number,
    cemetery: grave.cemetery?.name ?? "",
    date,
  });
};

// ─── Grave Detail Dialog ───────────────────────────────────────────────────────

const GraveDetailDialog = ({
  graveId,
  onClose,
}: {
  graveId: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery<SingleGrave>({
    queryKey: ["single-grave-dialog", graveId],
    queryFn: async () => {
      const res = await axios.get(`/api/graves/single/${graveId}`);
      return res.data;
    },
    enabled: Boolean(graveId),
    refetchOnWindowFocus: false,
  });

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, m: 1 } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        {data
          ? `${data.cemetery?.name} — ${t("grave.number")} ${data.number}`
          : t("actions.open")}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {isLoading || !data ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Grave info */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="overline" color="text.secondary">
                {t("grave.title")}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} mt={0.5}>
                <Chip size="small" label={`${t("grave.type")}: ${data.graveType?.name ?? "—"}`} />
                {data.field != null && (
                  <Chip size="small" label={`${t("grave.field")}: ${data.field}`} />
                )}
                {data.row != null && (
                  <Chip size="small" label={`${t("grave.row")}: ${data.row}`} />
                )}
                {data.capacity != null && (
                  <Chip size="small" label={`${t("grave.capacity")}: ${data.capacity}`} />
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Contract */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="overline" color="text.secondary">
                {t("grave.contract-expiration-date")}
              </Typography>
              <Box mt={0.5}>{expiredContract(data.contractTo)}</Box>
            </Box>

            <Divider />

            {/* Deceased */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="overline" color="text.secondary">
                {t("deceased.title")} ({data.deceased?.length ?? 0})
              </Typography>
              {data.deceased?.length > 0 ? (
                <List dense disablePadding>
                  {data.deceased.map((d) => (
                    <ListItem key={d._id} disablePadding sx={{ py: 0.25 }}>
                      <ListItemText
                        primary={`${d.surname} ${d.name}`}
                        secondary={
                          d.dateBirth || d.dateDeath
                            ? `${d.dateBirth ? dateFormatter(d.dateBirth) : "?"} – ${d.dateDeath ? dateFormatter(d.dateDeath) : "?"}`
                            : undefined
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.disabled" mt={0.5}>
                  —
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Payers */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="overline" color="text.secondary">
                {t("report.active-payer")}
              </Typography>
              {data.payers?.length > 0 ? (
                <List dense disablePadding>
                  {data.payers.map((p) => (
                    <ListItem key={p._id} disablePadding sx={{ py: 0.25 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <span>{p.surname} {p.name}</span>
                            {p.active && <Chip label={t("common.yes")} color="success" size="small" />}
                          </Box>
                        }
                        secondary={p.phone || undefined}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.disabled" mt={0.5}>
                  —
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Reminder Card ─────────────────────────────────────────────────────────────

const ReminderCard = ({
  grave,
  bucket,
  onOpenDetails,
}: {
  grave: GraveInReport;
  bucket: BucketKey;
  onOpenDetails: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const payer = grave.activePayer;
  const hasPhone = Boolean(payer?.phone);

  const smsHref = hasPhone
    ? `sms:${payer!.phone}?body=${encodeURIComponent(buildSmsBody(grave, t))}`
    : undefined;

  const callHref = hasPhone ? `tel:${payer!.phone}` : undefined;

  const bucketColor: Record<BucketKey, "error" | "warning" | "info" | "default"> = {
    all: "default",
    expired: "error",
    within30days: "warning",
    within60days: "warning",
    within90days: "info",
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: bucket !== "all" ? `${bucketColor[bucket]}.main` : undefined,
        borderWidth: bucket !== "all" ? 2 : 1,
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Cemetery + grave */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {grave.cemetery?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("grave.number")}: {grave.number}
              {grave.field != null && ` · ${t("grave.field")}: ${grave.field}`}
              {grave.row != null && ` · ${t("grave.row")}: ${grave.row}`}
            </Typography>
          </Box>
          <Tooltip title={t("actions.open")}>
            <IconButton
              size="small"
              onClick={() => onOpenDetails(grave._id)}
              sx={{ ml: 1, mt: -0.5 }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Contract date */}
        <Box mt={1.5}>{expiredContract(grave.contractTo)}</Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Payer */}
        {payer ? (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {payer.surname} {payer.name}
            </Typography>
            {payer.phone ? (
              <Typography variant="body2" color="text.secondary">
                {payer.phone}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.disabled">
                {t("reminder.no-phone")}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.disabled">
            {t("reminder.no-payer")}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<SmsIcon />}
          fullWidth
          disabled={!hasPhone}
          component={hasPhone ? "a" : "button"}
          href={smsHref}
          sx={{ borderRadius: 2, fontWeight: 700, fontSize: "1rem" }}
        >
          SMS
        </Button>
        <Button
          variant="outlined"
          size="large"
          disabled={!hasPhone}
          component={hasPhone ? "a" : "button"}
          href={callHref}
          sx={{ borderRadius: 2, minWidth: 64 }}
        >
          <PhoneIcon />
        </Button>
      </CardActions>
    </Card>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────

const ContractReminderScreen = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<BucketKey>("expired");
  const [detailGraveId, setDetailGraveId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<ReportData>({
    queryKey: ["contract-expiry-report"],
    queryFn: async () => {
      const res = await axios.get("/api/graves/contract-expiry-report");
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <Typography color="error">{t("common.error")}</Typography>
      </Box>
    );
  }

  const allRows = [
    ...data.expired,
    ...data.within30days,
    ...data.within60days,
    ...data.within90days,
  ];

  const bucketRows: Record<BucketKey, GraveInReport[]> = {
    all: allRows,
    expired: data.expired,
    within30days: data.within30days,
    within60days: data.within60days,
    within90days: data.within90days,
  };

  const visibleRows = bucketRows[tab];

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", pb: 4 }}>
      {/* Title */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {t("reminder.title")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t("reminder.subtitle", { total: allRows.length })}
        </Typography>
      </Box>

      {/* Sticky tabs */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            value="expired"
            label={
              <Badge badgeContent={data.summary.expired} color="error" max={99}>
                <Box sx={{ pr: 1 }}>{t("report.expired")}</Box>
              </Badge>
            }
          />
          <Tab
            value="within30days"
            label={
              <Badge badgeContent={data.summary.within30days} color="warning" max={99}>
                <Box sx={{ pr: 1 }}>30d</Box>
              </Badge>
            }
          />
          <Tab
            value="within60days"
            label={
              <Badge badgeContent={data.summary.within60days} color="warning" max={99}>
                <Box sx={{ pr: 1 }}>60d</Box>
              </Badge>
            }
          />
          <Tab
            value="within90days"
            label={
              <Badge badgeContent={data.summary.within90days} color="info" max={99}>
                <Box sx={{ pr: 1 }}>90d</Box>
              </Badge>
            }
          />
          <Tab
            value="all"
            label={
              <Badge badgeContent={allRows.length} color="default" max={99}>
                <Box sx={{ pr: 1 }}>{t("reminder.tab-all")}</Box>
              </Badge>
            }
          />
        </Tabs>
      </Box>

      {/* Card list */}
      <Stack spacing={1.5} sx={{ px: 2, pt: 2 }}>
        {visibleRows.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography color="text.secondary">{t("report.no-records")}</Typography>
          </Box>
        ) : (
          visibleRows.map((grave) => (
            <ReminderCard
              key={grave._id}
              grave={grave}
              bucket={tab}
              onOpenDetails={setDetailGraveId}
            />
          ))
        )}
      </Stack>

      {/* Grave detail dialog */}
      {detailGraveId && (
        <GraveDetailDialog
          graveId={detailGraveId}
          onClose={() => setDetailGraveId(null)}
        />
      )}
    </Box>
  );
};

export default ContractReminderScreen;
