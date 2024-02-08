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

function Copyright(props: any) {
  const { t } = useTranslation();
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        {t("CLIENT_YOUR_WEBSITE")}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function SignIn() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<any>();

  let navigate = useNavigate();
  const userStatus = useSelector(getUserStatus);
  const error = useSelector(getUserError);

  useEffect(() => {
    if (userStatus === "succeeded") {
      navigate("/landing");
    }
  }, [navigate, userStatus]);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
    dispatch(
      loginUser({
        email: data.get("email"),
        password: data.get("password"),
      })
    );
  };

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
          ])}
        >
          <Alert severity="error">
            {t(
              showOnErrors(error, [
                "SERVER_ERR_INVALID_EMAIL_OR_PASSWORD",
                "SERVER_ERR_USER_IS_NOT_VERIFIED",
              ])
            )}
          </Alert>
        </Collapse>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            error={triggerOnErrors(error, ["SERVER_ERR_USERNAME_IS_MANDATORY"])}
            helperText={t(
              showOnErrors(error, ["SERVER_ERR_USERNAME_IS_MANDATORY"])
            )}
            id="email"
            label={t("email")}
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            error={triggerOnErrors(error, ["SERVER_ERR_PASSWORD_IS_MANDATORY"])}
            helperText={t(
              showOnErrors(error, ["SERVER_ERR_PASSWORD_IS_MANDATORY"])
            )}
            name="password"
            label={t("password")}
            type="password"
            id="password"
            autoComplete="current-password"
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
