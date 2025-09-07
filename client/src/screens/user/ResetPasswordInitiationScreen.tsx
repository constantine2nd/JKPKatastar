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
  resetPasswordInitiation,
} from "../../features/userSlice";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import { useTranslation } from "react-i18next";
import { Alert, Collapse } from "@mui/material";
import { Copyright } from "../../components/Copyright";
import { object, string } from "yup";
import { useFormik } from "formik";
import { ServerErrorComponent } from "../../components/ServerErrorComponent";

const watchServerErrors: string[] = ["SERVER_ERR_CANNOT_RESET_PASSWORD"];

export default function ResetPasswordInitiation() {
  const { t } = useTranslation();

  interface IFormValues {
    email: string;
  }

  const initialValues: IFormValues = {
    email: "",
  };

  const validationSchema = object({
    email: string().required(t("client.err-field-required")),
  });

  const onSubmit = (values: IFormValues) => {
    dispatch(resetPasswordInitiation(values));
  };

  const formik = useFormik<IFormValues>({
    validationSchema,
    initialValues,
    onSubmit,
  });

  const dispatch = useDispatch<any>();

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
            id="email"
            label={t("email")}
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
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
