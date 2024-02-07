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
  getUserError,
  getUserStatus,
  resetPassword,
} from "../features/userSlice";
import { useEffect } from "react";
import Loader from "../components/Loader";
import { useTranslation } from "react-i18next";
import { Alert, Collapse } from "@mui/material";
import { showOnErrors, triggerOnErrors } from "../components/CommonFuntions";
import { useSearchParams } from "react-router-dom";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("token");

  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<any>();

  let navigate = useNavigate();
  const userStatus = useSelector(getUserStatus);
  const error = useSelector(getUserError);

  useEffect(() => {}, [navigate, userStatus]);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    dispatch(
      resetPassword({
        token: query,
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
        <Collapse
          in={triggerOnErrors(error, [
            "SERVER_ERR_CANNOT_RESET_PASSWORD",
            "SERVER_ERR_CONFIRM_PASSWORD",
          ])}
        >
          <Alert severity="error">
            {t(
              showOnErrors(error, [
                "SERVER_ERR_CANNOT_RESET_PASSWORD",
                "SERVER_ERR_CONFIRM_PASSWORD",
              ])
            )}
          </Alert>
        </Collapse>
        <Collapse in={userStatus === "succeeded" ? true : false}>
          <Alert severity="info">
            "Reset password initiated. Please check you email."
          </Alert>
        </Collapse>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
            {t("Submit")}
          </Button>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
