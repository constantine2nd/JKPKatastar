import { Chip } from "@mui/material";
import { dateFormatter } from "../utils/dateFormatter";

const capacity = (capacity: string, numberOfDeceaseds: string) => {
  let result = null;
  const capacityNum = Number(capacity);
  const deceasedsNum = Number(numberOfDeceaseds);
  if (capacityNum - deceasedsNum === 0) {
    result = <Chip label={`${numberOfDeceaseds}/${capacity}`} color="error" />;
  } else if (deceasedsNum / capacityNum > 0.49) {
    result = (
      <Chip label={`${numberOfDeceaseds}/${capacity}`} color="warning" />
    );
  } else {
    result = (
      <Chip label={`${numberOfDeceaseds}/${capacity}`} color="success" />
    );
  }
  return result;
};

const expiredContract = (contractTo: string) => {
  let result = null;
  let contractDate = new Date(contractTo);
  let contractDatePlus = new Date(contractTo);
  contractDatePlus.setMonth(contractDatePlus.getMonth() - 3);
  let today = new Date();
  if (today > contractDate) {
    result = <Chip label={dateFormatter(contractTo)} color="error" />;
  } else if (today > contractDatePlus) {
    result = <Chip label={dateFormatter(contractTo)} color="warning" />;
  } else {
    result = <Chip label={dateFormatter(contractTo)} color="success" />;
  }
  return result;
};

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

const statusOfGrave = (status: string, t: any) => {
  let result = null;
  if (status === 'FREE') { // Only FREE
    result = <Chip label={t("FREE")} color="success" />;
  } else { // OCCUPIED or without any value
    result = <Chip label={t("OCCUPIED")} color="warning" />;
  }
  return result;
};

export { expiredContract, capacity, isActiveUser, isActivePayer, statusOfGraveRequest, statusOfGrave };
