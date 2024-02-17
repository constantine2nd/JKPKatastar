import React, { useState, useEffect, useRef, useMemo } from "react";
import Button from "@mui/material/Button";
import TextField, { OutlinedTextFieldProps } from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Autocomplete, AutocompleteRenderInputParams } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useSelector, useDispatch } from "react-redux";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
import axios from "axios";

import DeceasedTableComponent from "../components/DeceasedTableComponent";
import {
  fetchCemeteries,
  selectAllCemeteries,
  getAllCemeteriesError,
  getAllCemeteriesStatus,
} from "../features/cemeteriesSlice";

import { Cemetery } from "../interfaces/CemeteryInterfaces";

const DeceasedSearchScreen = () => {
  const [cemeteryIds, setCemeteryIds] = React.useState("");
  const [name, setName] = React.useState("");
  const [surname, setSurname] = React.useState("");
  const [birthYear, setBirthYear] = React.useState();
  const [deathYearFrom, setDeathYearFrom] = React.useState();
  const [deathYearTo, setDeathYearTo] = React.useState();
  const [showTable, setShowTable] = React.useState(false);
  const [path, setPath] = React.useState("");
  const cemeteries = useSelector(selectAllCemeteries);
  const usersStatus = useSelector(getAllCemeteriesStatus);
  const error = useSelector(getAllCemeteriesError);
  const dispatch = useDispatch();

  useEffect(() => {
    if (usersStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchCemeteries());
    }
  }, [usersStatus, dispatch]);

  const handleChangeCemetery = (event, value) => {
    let slelectedCemeteriesIds = value.map((cemetery) => cemetery._id);
    setCemeteryIds(slelectedCemeteriesIds);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const obj = {
      cemeteryIds,
      name,
      surname,
      birthYear: birthYear?.toString() || "",
      deathYearFrom: deathYearFrom?.toString() || "",
      deathYearTo: deathYearTo?.toString() || "",
    };

    const queryParams = new URLSearchParams({
      ...obj,
    }).toString();
    console.log(queryParams);
    setPath(`/api/deceased/search?${queryParams}`);
    setShowTable(true);
  };
  return (
    <>
      <Container component="main" maxWidth="xs">
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            mt: 1,
            marginTop: 8,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label={"name"}
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="surname"
            label={"surname"}
            name="surname"
            autoComplete="surname"
            autoFocus
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />

          <FormControl fullWidth>
            <Autocomplete
              onChange={handleChangeCemetery}
              multiple
              options={cemeteries}
              getOptionLabel={(option) => option.name}
              disableCloseOnSelect
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Multiple Autocomplete"
                  placeholder="Multiple Autocomplete"
                />
              )}
              renderOption={(props, option, { selected }) => (
                <MenuItem
                  {...props}
                  key={option._id}
                  value={option._id}
                  sx={{ justifyContent: "space-between" }}
                >
                  {option.name}
                  {selected ? <CheckIcon color="info" /> : null}
                </MenuItem>
              )}
            />
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            name="birth-year"
            label={"birth-year"}
            id="birth-year"
            autoComplete="birth-year"
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="death-year-from"
            label={"death-year-from"}
            id="death-year-from"
            autoComplete="death-year-from"
            type="number"
            value={deathYearFrom}
            onChange={(e) => setDeathYearFrom(Number(e.target.value))}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="death-year-to"
            label={"death-year-to"}
            id="death-year-to"
            autoComplete="death-year-to"
            type="number"
            value={deathYearTo}
            onChange={(e) => setDeathYearTo(Number(e.target.value))}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {"Search"}
          </Button>
        </Box>
      </Container>
      {showTable && <DeceasedTableComponent path={path} graveCapcity={6} />}
    </>
  );
};

export default DeceasedSearchScreen;
