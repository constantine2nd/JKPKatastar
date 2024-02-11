import { Alert, Collapse } from "@mui/material";
import { showOnErrors, triggerOnErrors } from "./CommonFuntions";
import { useTranslation } from "react-i18next";

type Props = {
  error: string;
  watchServerErrors: string[];
};

export function ServerErrorComponent({ error, watchServerErrors }: Props) {
  const { t } = useTranslation();
  return (
    <Collapse in={triggerOnErrors(error, watchServerErrors)}>
      <Alert severity="error">
        {t(showOnErrors(error, watchServerErrors))}
      </Alert>
    </Collapse>
  );
}
