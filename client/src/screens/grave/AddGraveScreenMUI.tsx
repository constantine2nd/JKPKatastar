import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { object, string } from "yup";
import { Copyright } from "../../components/Copyright";
import Loader from "../../components/Loader";
import { ServerErrorComponent } from "../../components/ServerErrorComponent";
import {
  addSingleGrave,
  getGravesError,
  getGravesStatus,
} from "../../features/gravesSlice";
import { Cemetery } from "../../interfaces/CemeteryInterfaces";
import { GraveType } from "../../interfaces/GraveTypeInterfaces";

import {
  fetchCemeteries,
  selectAllCemeteries,
} from "../../features/cemeteriesSlice";
import {
  getAllGraveTypes,
  selectAllGraveTypes,
} from "../../features/graveTypesSlice";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import { MenuItem } from "@mui/material";

const watchServerErrors: string[] = [
  "SERVER_ERR_INVALID_EMAIL_OR_PASSWORD",
  "SERVER_ERR_USER_IS_NOT_VERIFIED",
  "SERVER_ERR_PASSWORD_IS_MANDATORY",
  "SERVER_ERR_USERNAME_IS_MANDATORY",
];

const AddGraveScreenMUI: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<any>();
  let navigate = useNavigate();
  const gravesStatus = useSelector(getGravesStatus);
  const error = useSelector(getGravesError);
  const cemeteries = useSelector(selectAllCemeteries);
  const graveTypes = useSelector(selectAllGraveTypes);

  interface IFormValues {
    graveField: string;
    graveRow: string;
    graveNumber: string;
    LAT: string;
    LON: string;
    cemetery: string;
    graveType: string;
  }

  const initialValues: IFormValues = {
    graveField: "",
    graveRow: "",
    graveNumber: "",
    LAT: "",
    LON: "",
    cemetery: "",
    graveType: "",
  };

  const validationSchema = object({
    graveField: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    graveRow: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    graveNumber: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    LAT: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    LON: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    cemetery: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    graveType: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
  });

  const onSubmit = (values: IFormValues) => {
    console.log(values);
    dispatch(addSingleGrave(values));
    navigate("/", { state: { sender: "ADDGraveSreen" } });
  };

  const formik = useFormik<IFormValues>({
    validationSchema,
    initialValues,
    onSubmit,
  });

  useEffect(() => {
    dispatch(fetchCemeteries());
    dispatch(getAllGraveTypes());
  }, [dispatch]);

  if (gravesStatus === "loading") {
    return <Loader />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {t("Create new grave")}
        </Typography>
        <ServerErrorComponent {...{ error, watchServerErrors }} />
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="graveField"
            label={t("graveField")}
            name="graveField"
            autoComplete="graveField"
            autoFocus
            value={formik.values.graveField}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.graveField && Boolean(formik.errors.graveField)
            }
            helperText={formik.touched.graveField && formik.errors.graveField}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="graveRow"
            label={t("graveRow")}
            id="graveRow"
            autoComplete="graveRow"
            value={formik.values.graveRow}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.graveRow && Boolean(formik.errors.graveRow)}
            helperText={formik.touched.graveRow && formik.errors.graveRow}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="graveNumber"
            label={t("graveNumber")}
            id="graveNumber"
            autoComplete="graveNumber"
            value={formik.values.graveNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.graveNumber && Boolean(formik.errors.graveNumber)
            }
            helperText={formik.touched.graveNumber && formik.errors.graveNumber}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="LAT"
            label={t("LAT")}
            id="LAT"
            autoComplete="LAT"
            value={formik.values.LAT}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.LAT && Boolean(formik.errors.LAT)}
            helperText={formik.touched.LAT && formik.errors.LAT}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="LON"
            label={t("LON")}
            id="LON"
            autoComplete="LON"
            value={formik.values.LON}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.LON && Boolean(formik.errors.LON)}
            helperText={formik.touched.LON && formik.errors.LON}
          />
          <TextField
            margin="normal"
            fullWidth
            label="cemetery"
            name="cemetery"
            id="cemetery"
            value={formik.values.cemetery}
            select
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.cemetery && Boolean(formik.errors.cemetery)}
            helperText={formik.touched.cemetery && formik.errors.cemetery}
          >
            {cemeteries.map((cemetery) => (
              <MenuItem key={cemetery._id} value={cemetery._id}>
                {cemetery.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="normal"
            fullWidth
            label="graveType"
            name="graveType"
            id="graveType"
            value={formik.values.graveType}
            select
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.graveType && Boolean(formik.errors.graveType)}
            helperText={formik.touched.graveType && formik.errors.graveType}
          >
            {graveTypes.map((graveType) => (
              <MenuItem key={graveType._id} value={graveType._id}>
                {graveType.name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {t("add-grave")}
          </Button>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
};
export default AddGraveScreenMUI;
