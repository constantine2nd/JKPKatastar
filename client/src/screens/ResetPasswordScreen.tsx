import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Container from "@mui/material/Container";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  getUserError,
  getUserStatus,
  resetPassword,
} from "../features/userSlice";
import { useEffect } from "react";
import Loader from "../components/Loader";
import { useTranslation } from "react-i18next";
import { Alert, Collapse } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { Copyright } from "../components/Copyright";
import { object, string } from "yup";
import { useFormik } from "formik";
import { ServerErrorComponent } from "../components/ServerErrorComponent";

const watchServerErrors: string[] = [
  "SERVER_ERR_CANNOT_RESET_PASSWORD",
  "SERVER_ERR_CONFIRM_PASSWORD",
];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("token");

  const { t } = useTranslation();
  const dispatch = useDispatch<any>();

  interface IFormValues {
    "repeated-password": string;
    password: string;
  }

  const initialValues: IFormValues = {
    "repeated-password": "",
    password: "",
  };

  const validationSchema = object({
    password: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    "repeated-password": string().required(
      t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")
    ),
  });

  const onSubmit = (values: IFormValues) => {
    console.log(values);
    dispatch(resetPassword({ token: query, ...values }));
  };

  const formik = useFormik<IFormValues>({
    validationSchema,
    initialValues,
    onSubmit,
  });

  let navigate = useNavigate();
  const userStatus = useSelector(getUserStatus);
  const error = useSelector(getUserError);

  useEffect(() => {}, [navigate, userStatus]);

  if (userStatus === "loading") {
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
        <ServerErrorComponent {...{ error, watchServerErrors }} />
        <Collapse in={userStatus === "succeeded" ? true : false}>
          <Alert severity="info">
            "Reset password initiated. Please check you email."
          </Alert>
        </Collapse>
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
            name="password"
            label={t("password")}
            type="password"
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="repeated-password"
            label={t("repeat-password")}
            type="password"
            id="repeated-password"
            autoComplete="current-password"
            value={formik.values["repeated-password"]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched["repeated-password"] &&
              Boolean(formik.errors["repeated-password"])
            }
            helperText={
              formik.touched["repeated-password"] &&
              formik.errors["repeated-password"]
            }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {t("Submit")}
          </Button>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
