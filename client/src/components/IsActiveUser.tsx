import { Chip } from "@mui/material";

const isActiveUser = (isActive: boolean, t: any) => {
  let result = null;
  if (isActive) {
    result = <Chip label={t("yes")} color="success" />;
  } else {
    result = <Chip label={t("no")} color="error" />;
  }
  return result;
};

const isActivePayer = (isActive: boolean, t: any) => {
  let result = null;
  if (isActive) {
    result = <Chip label={t("yes")} color="success" />;
  } else {
    result = <Chip label={t("no")} color="error" />;
  }
  return result;
};

const statusOfGraveRequest = (status: string, t: any) => {
  let result = null;
  if (status === 'ACCEPTED') {
    result = <Chip label={t("ACCEPTED")} color="success" />;
  } else if(status === 'DENIED') {
    result = <Chip label={t("DENIED")} color="error" />;
  } else {
    result = <Chip label={t("REQUESTED")} color="warning" />;
  }
  return result;
};

export { isActiveUser, isActivePayer, statusOfGraveRequest };
