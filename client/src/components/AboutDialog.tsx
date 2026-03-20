import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { version } from "../../package.json";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AboutDialog = ({ open, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("about.title")}</DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="h6">JKP Katastar</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("about.description")}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>{t("about.version")}:</strong> {version}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            © {new Date().getFullYear()} JKP Katastar
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("actions.back")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AboutDialog;
