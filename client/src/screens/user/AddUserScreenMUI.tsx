import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  addUserVisitor,
  getUserError,
  getUserStatus,
} from "../../features/userSlice";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import { useTranslation } from "react-i18next";
import { Copyright } from "../../components/Copyright";
import { useFormik } from "formik";
import { object, string } from "yup";
import { ServerErrorComponent } from "../../components/ServerErrorComponent";

const watchServerErrors: string[] = [
  "SERVER_ERR_USER_ALREADY_EXISTS",
  "SERVER_ERR_CONFIRM_PASSWORD",
  "SERVER_ERR_CANNOT_ADD_USER",
];

export default function SignUp() {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();

  interface IFormValues {
    name: string;
    email: string;
    password: string;
    "repeated-password": string;
  }

  const initialValues: IFormValues = {
    name: "",
    email: "",
    "repeated-password": "",
    password: "",
  };

  const validationSchema = object({
    name: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    email: string().email().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    password: string().required(t("CLIENT_ERR_THE_FIELD_IS_REQUIRED")),
    "repeated-password": string().required(
      t("CLIENT_ERR_THE_FIELD_IS_REQUIRED"),
    ),
  });

  const onSubmit = (values: IFormValues) => {
    console.log(values);
    dispatch(addUserVisitor(values));
  };

  const formik = useFormik<IFormValues>({
    validationSchema,
    initialValues,
    onSubmit,
  });

  let navigate = useNavigate();
  const userStatus = useSelector(getUserStatus);
  const error = useSelector(getUserError);

  useEffect(() => {
    if (userStatus === "succeeded") {
      navigate("/landing");
    }
  }, [navigate, userStatus, error]);

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
        <Typography component="h1" variant="h5">
          {t("Sign up")}
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
            id="name"
            label={t("name")}
            name="name"
            autoComplete="name"
            autoFocus
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t("email")}
            name="email"
            autoComplete="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
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
            {t("Sign up")}
          </Button>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
