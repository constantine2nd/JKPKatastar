import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useTranslation } from "react-i18next";
import pkg from "../../package.json";

const { version } = pkg;

interface Props {
  open: boolean;
  onClose: () => void;
}

const AboutDialog = ({ open, onClose }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      {/* Coloured header band */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          py: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.common.white, 0.15),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <AccountBalanceIcon sx={{ fontSize: 40, color: "white" }} />
        </Box>
        <Typography variant="h5" fontWeight={700} color="white" letterSpacing={1}>
          JKP Katastar
        </Typography>
        <Chip
          label={`v${version}`}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.common.white, 0.2),
            color: "white",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      </Box>

      <DialogContent sx={{ textAlign: "center", pt: 3, pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("about.description")}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          © {new Date().getFullYear()} JKP Katastar
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button variant="contained" onClick={onClose} sx={{ px: 4 }}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AboutDialog;
