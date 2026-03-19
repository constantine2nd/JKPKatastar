import { Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export function Copyright(props: any) {
    const { t } = useTranslation();
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        {...props}
      >
        {"Copyright © "}
        <Link color="inherit" href="https://mui.com/">
          {t("client.your-website")}
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
    );
  }