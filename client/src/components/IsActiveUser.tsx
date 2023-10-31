import { Chip } from "@mui/material";


const isActiveUser = (isActive: boolean, t: any) => {
    let result = null;
    if (isActive) {
      result = <Chip label={t('yes')} color="success" />;
    } else {
      result = <Chip label={t('no')} color="error" />;
    }
    return result;
  };

  export { isActiveUser };