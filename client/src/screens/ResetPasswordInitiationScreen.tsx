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
import { getUserError, getUserStatus, loginUser, resetPasswordInitiation } from "../features/userSlice";
import { useEffect } from "react";
import Loader from "../components/Loader";
import { useTranslation } from "react-i18next";
import { Alert, Collapse, Snackbar } from "@mui/material";
import { showOnErrors, triggerOnErrors } from "../components/CommonFuntions";

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

export default function ResetPasswordInitiation() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<any>();

  let navigate = useNavigate();
  const userStatus = useSelector(getUserStatus);
  const error = useSelector(getUserError);

  useEffect(() => {

  }, [navigate, userStatus]);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
    });
    dispatch(
      resetPasswordInitiation({
        email: data.get("email"),
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
        <Collapse in={triggerOnErrors(error, ["SERVER_ERR_CANNOT_RESET_PASSWORD"])}>
          <Alert severity="error">{t(showOnErrors(error, ["SERVER_ERR_CANNOT_RESET_PASSWORD"]))}</Alert>
        </Collapse>
        <Collapse in={userStatus === "succeeded" ? true : false}>
          <Alert severity="info">"Reset password initiated. Please check you email."</Alert>
        </Collapse>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            error={triggerOnErrors(error, [])}
            helperText={t(showOnErrors(error, []))}
            id="email"
            label={t("email")}
            name="email"
            autoComplete="email"
            autoFocus
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
