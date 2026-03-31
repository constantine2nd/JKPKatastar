import { useState } from "react";
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
  Select,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import BackupIcon from "@mui/icons-material/Backup";

const COLLECTIONS = [
  "cemeteries",
  "gravetypes",
  "graves",
  "deceaseds",
  "payers",
  "users",
] as const;

type Collection = (typeof COLLECTIONS)[number];

const ExportWizardScreen = () => {
  const { t } = useTranslation();
  const user = useSelector(selectUser);

  const [collection, setCollection] = useState<Collection>("graves");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [backingUp, setBackingUp] = useState(false);
  const [backupError, setBackupError] = useState("");

  const handleFullBackup = async () => {
    setBackingUp(true);
    setBackupError("");
    try {
      const response = await axios.get("/api/backup/full", {
        headers: { Authorization: `Bearer ${user?.token}` },
        responseType: "blob",
      });
      const timestamp = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/gzip" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${timestamp}.json.gz`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setBackupError(t("backup.error"));
    } finally {
      setBackingUp(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const response = await axios.get(`/api/export/${collection}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([response.data], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${collection}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError(t("export.error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>

      {/* Full backup section */}
      <Typography variant="h5" fontWeight={600} mb={1}>
        {t("backup.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {t("backup.description")}
      </Typography>
      {backupError && (
        <Alert severity="error" sx={{ mb: 2 }}>{backupError}</Alert>
      )}
      <Button
        variant="contained"
        color="success"
        size="large"
        startIcon={backingUp ? <CircularProgress size={18} color="inherit" /> : <BackupIcon />}
        disabled={backingUp}
        onClick={handleFullBackup}
        sx={{ mb: 4 }}
      >
        {backingUp ? t("backup.backing-up") : t("backup.btn-backup")}
      </Button>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h5" fontWeight={600} mb={3}>
        {t("export.title")}
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        {t("export.description")}
      </Typography>

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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        size="large"
        startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
        disabled={exporting}
        onClick={handleExport}
      >
        {exporting ? t("export.exporting") : t("export.btn-export")}
      </Button>
    </Box>
  );
};

export default ExportWizardScreen;
