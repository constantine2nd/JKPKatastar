import { Chip } from "@mui/material";

const isActiveUser = (isActive: boolean) => {
    let result = null;
    if (isActive) {
      result = <Chip label={'DA'} color="success" />;
    } else {
      result = <Chip label={'NE'} color="error" />;
    }
    return result;
  };

  export { isActiveUser };