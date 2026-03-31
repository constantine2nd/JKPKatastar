import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import axios from "axios";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RestoreIcon from "@mui/icons-material/SettingsBackupRestore";

const COLLECTIONS = [
  "cemeteries",
  "gravetypes",
  "graves",
  "deceaseds",
  "payers",
  "users",
] as const;

type Collection = (typeof COLLECTIONS)[number];

interface PreviewResult {
  total: number;
  preview: Record<string, unknown>[];
}

interface ImportResult {
  inserted: number;
  total: number;
  errors: { index: number; message: string }[];
}

const ImportWizardScreen = () => {
  const { t } = useTranslation();
  const user = useSelector(selectUser);

  const [activeStep, setActiveStep] = useState(0);
  const [collection, setCollection] = useState<Collection>("graves");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<Record<string, { inserted: number; total: number; errors: { index: number; message: string }[] }> | null>(null);
  const [restoreError, setRestoreError] = useState("");

  const steps = [
    t("import.step-collection"),
    t("import.step-upload"),
    t("import.step-result"),
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(null);
    setPreviewError("");

    const formData = new FormData();
    formData.append("file", selected);
    setPreviewLoading(true);
    try {
      const { data } = await axios.post<PreviewResult>(
        "/api/import/preview",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );
      setPreview(data);
    } catch {
      setPreviewError(t("import.error"));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setImportError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await axios.post<ImportResult>(
        `/api/import/${collection}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.token}`,
          },
          validateStatus: (s) => s < 500,
        },
      );
      setResult(data);
      setActiveStep(2);
    } catch {
      setImportError(t("import.error"));
    } finally {
      setImporting(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoring(true);
    setRestoreError("");
    setRestoreResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await axios.post(
        "/api/backup/restore",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.token}`,
          },
          validateStatus: (s) => s < 500,
        },
      );
      setRestoreResult(data.results);
    } catch {
      setRestoreError(t("backup.restore-error"));
    } finally {
      setRestoring(false);
      if (restoreInputRef.current) restoreInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setPreview(null);
    setPreviewError("");
    setResult(null);
    setImportError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const previewColumns =
    preview && preview.preview.length > 0
      ? Object.keys(preview.preview[0]).slice(0, 8)
      : [];

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>

      {/* Full restore section */}
      <Typography variant="h5" fontWeight={600} mb={1}>
        {t("backup.restore-title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {t("backup.restore-description")}
      </Typography>
      {restoreError && <Alert severity="error" sx={{ mb: 2 }}>{restoreError}</Alert>}
      {restoreResult && (
        <Box mb={2}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>{t("import.collection-label")}</strong></TableCell>
                  <TableCell align="right"><strong>{t("backup.restore-inserted")}</strong></TableCell>
                  <TableCell align="right"><strong>{t("backup.restore-total")}</strong></TableCell>
                  <TableCell align="right"><strong>{t("backup.restore-errors")}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(restoreResult).map(([col, r]) => (
                  <TableRow key={col}>
                    <TableCell>{t(`import.collection-${col}`)}</TableCell>
                    <TableCell align="right">{r.inserted}</TableCell>
                    <TableCell align="right">{r.total}</TableCell>
                    <TableCell align="right" sx={{ color: r.errors.length > 0 ? "warning.main" : "inherit" }}>
                      {r.errors.length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      <Button
        variant="contained"
        color="warning"
        size="large"
        startIcon={restoring ? <CircularProgress size={18} color="inherit" /> : <RestoreIcon />}
        disabled={restoring}
        onClick={() => restoreInputRef.current?.click()}
        sx={{ mb: 4 }}
      >
        {restoring ? t("backup.restoring") : t("backup.btn-restore")}
      </Button>
      <input ref={restoreInputRef} type="file" accept=".json,.json.gz,.gz" hidden onChange={handleRestore} />

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h5" fontWeight={600} mb={3}>
        {t("import.title")}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Select collection */}
      {activeStep === 0 && (
        <Box>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t("import.collection-label")}</InputLabel>
            <Select
              value={collection}
              label={t("import.collection-label")}
              onChange={(e) => setCollection(e.target.value as Collection)}
            >
              {COLLECTIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {t(`import.collection-${c}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => setActiveStep(1)}
          >
            {t("import.btn-next")}
          </Button>
        </Box>
      )}

      {/* Step 1: Upload file + preview */}
      {activeStep === 1 && (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("import.collection-label")}:{" "}
            <strong>{t(`import.collection-${collection}`)}</strong>
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              mb: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
              borderStyle: "dashed",
              borderWidth: 2,
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadFileIcon sx={{ fontSize: 48, color: "text.secondary" }} />
            <Typography color="text.secondary">
              {file ? file.name : t("import.drop-hint")}
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              hidden
              onChange={handleFileChange}
            />
          </Paper>

          {previewLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={28} />
            </Box>
          )}

          {previewError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {previewError}
            </Alert>
          )}

          {preview && (
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {t("import.total-records")}: <strong>{preview.total}</strong>
              </Typography>
              <Typography variant="subtitle2" mb={1}>
                {t("import.preview-title")}
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {previewColumns.map((col) => (
                        <TableCell key={col}>
                          <strong>{col}</strong>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.preview.map((row, i) => (
                      <TableRow key={i}>
                        {previewColumns.map((col) => (
                          <TableCell key={col} sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {JSON.stringify((row as any)[col])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importError}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
              disabled={importing}
            >
              {t("import.btn-back")}
            </Button>
            <Button
              variant="contained"
              disabled={!preview || importing}
              onClick={handleImport}
              startIcon={importing ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {importing ? t("import.importing") : t("import.btn-import")}
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2: Result */}
      {activeStep === 2 && result && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          {result.errors.length === 0 ? (
            <>
              <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
              <Typography variant="h6">
                {t("import.success", {
                  inserted: result.inserted,
                  total: result.total,
                })}
              </Typography>
            </>
          ) : (
            <>
              <ErrorOutlineIcon sx={{ fontSize: 64, color: "warning.main", mb: 2 }} />
              <Typography variant="h6">
                {t("import.partial", {
                  inserted: result.inserted,
                  total: result.total,
                  errors: result.errors.length,
                })}
              </Typography>
            </>
          )}
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleReset}
          >
            {t("import.btn-new")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ImportWizardScreen;
