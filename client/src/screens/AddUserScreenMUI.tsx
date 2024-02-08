import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
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
} from "../features/userSlice";
import { useEffect } from "react";
import Loader from "../components/Loader";
import { useTranslation } from "react-i18next";
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

export default function SignUp() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<any>();

  let navigate = useNavigate();
  const userStatus = useSelector(getUserStatus);
  const error = useSelector(getUserError);

  useEffect(() => {
    if (userStatus === "succeeded") {
      navigate("/landing");
    }
  }, [navigate, userStatus, error]);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    dispatch(
      addUserVisitor({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
        repeatedPassword: data.get("repeated-password"),
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
          {t("Sign up")}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label={t("name")}
            name="name"
            autoComplete="name"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            error={triggerOnErrors(error, ["SERVER_ERR_USER_ALREADY_EXISTS"])}
            helperText={t(
              showOnErrors(error, ["SERVER_ERR_USER_ALREADY_EXISTS"])
            )}
            fullWidth
            id="email"
            label={t("email")}
            name="email"
            autoComplete="email"
          />
          <TextField
            margin="normal"
            required
            error={triggerOnErrors(error, ["SERVER_ERR_CONFIRM_PASSWORD"])}
            helperText={t(showOnErrors(error, ["SERVER_ERR_CONFIRM_PASSWORD"]))}
            fullWidth
            name="password"
            label={t("password")}
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <TextField
            margin="normal"
            required
            error={triggerOnErrors(error, ["SERVER_ERR_CONFIRM_PASSWORD"])}
            helperText={t(showOnErrors(error, ["SERVER_ERR_CONFIRM_PASSWORD"]))}
            fullWidth
            name="repeated-password"
            label={t("repeat-password")}
            type="password"
            id="repeated-password"
            autoComplete="current-password"
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
