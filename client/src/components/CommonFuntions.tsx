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
  if (status === "ACCEPTED") {
    result = <Chip label={t("ACCEPTED")} color="success" />;
  } else if (status === "DENIED") {
    result = <Chip label={t("DENIED")} color="error" />;
  } else {
    result = <Chip label={t("REQUESTED")} color="warning" />;
  }
  return result;
};

const statusOfGrave = (status: string, t: any) => {
  let result = null;
  if (status === "FREE") {
    // Only FREE
    result = <Chip label={t("FREE")} color="success" />;
  } else {
    // OCCUPIED or without any value
    result = <Chip label={t("OCCUPIED")} color="warning" />;
  }
  return result;
};

const capacityExt = (renderedValue: string) => {
  return capacity(renderedValue.split("/")[1], renderedValue.split("/")[0]);
};

function matchError(value: string, error: string) {
  return error?.includes(value);
}

const triggerOnErrors = (error: string, triggerErrors: string[]) => {
  const hasError = triggerErrors.find((te) => matchError(te, error));
  if (hasError) {
    return true;
  } else {
    return false;
  }
};

const showOnErrors = (error: string, triggerErrors: string[]) => {
  const errorText = triggerErrors.find((te) => matchError(te, error));
  if (errorText) {
    return errorText;
  } else {
    return "";
  }
};

function composeErrorMessageCommon(error: any) {
  console.log(error);
  let errorMessage = "";
  if (error?.response?.data?.message) {
    errorMessage = error.message + " <- " + error.response.data.message;
  } else if (error?.response && error?.request?.responseURL) {
    errorMessage =
      error.message +
      " <- " +
      error.response.statusText +
      " " +
      error.request.responseURL;
  } else {
    errorMessage = error.message;
  }
  return errorMessage;
}

const composeErrorMessageIntoPromise = (error: any) => {
  return Promise.reject(new Error(composeErrorMessageCommon(error)));
};

const composeErrorMessage = (error: any) => {
  return composeErrorMessageCommon(error);
};

export {
  expiredContract,
  capacity,
  isActiveUser,
  isActivePayer,
  statusOfGraveRequest,
  statusOfGrave,
  capacityExt,
  composeErrorMessageIntoPromise,
  composeErrorMessage,
  triggerOnErrors,
  showOnErrors,
};
