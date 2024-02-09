import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { getUserError, getUserStatus, loginUser } from "../features/userSlice";
import { useEffect } from "react";
import Loader from "../components/Loader";
import { useTranslation } from "react-i18next";
import { Alert, Collapse } from "@mui/material";
import { showOnErrors, triggerOnErrors } from "../components/CommonFuntions";
import { Copyright } from "../components/Copyright";
import { object, string, number, date, InferType } from "yup";
import { useFormik } from "formik";


export default function SignIn() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<any>();

  interface IFormValues {
    email: string;
    password: string;
  }
  
  const initialValues: IFormValues = {
    email: "",
    password: "",
  };

  const validationSchema = object({
    password: string().required(t("The field is Required")),
    email: string().email().required(t("The field is Required")),
  });

  const onSubmit = (values: IFormValues) => {
    console.log(values);
    dispatch(loginUser(values));
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
  }, [navigate, userStatus]);

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
          {t("Sign in")}
        </Typography>
        <Collapse
          in={triggerOnErrors(error, [
            "SERVER_ERR_INVALID_EMAIL_OR_PASSWORD",
            "SERVER_ERR_USER_IS_NOT_VERIFIED",
            "SERVER_ERR_PASSWORD_IS_MANDATORY",
            "SERVER_ERR_USERNAME_IS_MANDATORY",
          ])}
        >
          <Alert severity="error">
            {t(
              showOnErrors(error, [
                "SERVER_ERR_INVALID_EMAIL_OR_PASSWORD",
                "SERVER_ERR_USER_IS_NOT_VERIFIED",
                "SERVER_ERR_PASSWORD_IS_MANDATORY",
                "SERVER_ERR_USERNAME_IS_MANDATORY",
              ])
            )}
          </Alert>
        </Collapse>
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
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
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label={t("Remember me")}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {t("Sign in")}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="/reset-password-initiation" variant="body2">
                {t("Forgot password?")}
              </Link>
            </Grid>
            <Grid item>
              <Link href="/add-user" variant="body2">
                {t("Don't have an account? Sign Up")}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
