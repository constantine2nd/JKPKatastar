import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import {
  fetchCemeteries,
  selectAllCemeteries,
  getAllCemeteriesError,
  getAllCemeteriesStatus,
} from "../features/cemeteriesSlice";

import { Cemetery } from "../interfaces/CemeteryInterfaces";
import { getSelectedCemetery } from "../utils/cemeterySelector";

const LandingScreen: React.FC = () => {
  const cemeteries: Cemetery[] | null = useSelector(selectAllCemeteries);
  const [cemeteryId, setCemeteryId] = React.useState(getSelectedCemetery());
  let navigate = useNavigate();
  console.log(cemeteryId);
  const { t, i18n } = useTranslation();

  const handleChange = (event: SelectChangeEvent) => {
    const selectedCemetery = cemeteries?.find(
      (cem) => cem._id === event.target.value
    );
    navigate("/", { state: { cemetery: selectedCemetery } });
    setCemeteryId(event.target.value);
    localStorage.setItem("selected-cemetery", JSON.stringify(selectedCemetery));
  };

  const usersStatus = useSelector(getAllCemeteriesStatus);
  const error = useSelector(getAllCemeteriesError);
  const dispatch = useDispatch<any>();
  useEffect(() => {
    if (usersStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchCemeteries());
    }
  }, [usersStatus, dispatch]);

  if (usersStatus === "loading") {
    return <Loader />;
  }

  if (usersStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <h1>{t("Landing page screen")}</h1>
        <Box sx={{ minWidth: 400, maxWidth: 500 }}>
          <FormControl fullWidth>
            <InputLabel id="cemetery-select-label">{t("Cemetery")}</InputLabel>
            <Select
              labelId="cemetery-select-label"
              id="demo-simple-select"
              value={cemeteryId}
              label="Cemetery"
              onChange={handleChange}
            >
              {cemeteries?.map((cemetery) => (
                <MenuItem key={cemetery._id} value={cemetery._id}>
                  {cemetery.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </div>
    </>
  );
};

export default LandingScreen;
function createTheme(arg0: { palette: { mode: string } }) {
  throw new Error("Function not implemented.");
}
