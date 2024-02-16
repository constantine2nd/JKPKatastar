import React, { useState, useEffect, useRef, useMemo } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
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

const DeceasedSearchScreen: React.FC = () => {
  const [cemeteryId, setCemeteryId] = React.useState("");
  const [name, setName] = React.useState<string>("");
  const [surname, setSurname] = React.useState<string>("");
  const [birthYear, setBirthYear] = React.useState<number>();
  const [deathYearFrom, setDeathYearFrom] = React.useState<number>();
  const [deathYearTo, setDeathYearTo] = React.useState<number>();
  const [showTable, setShowTable] = React.useState<boolean>(false);
  const [path, setPath] = React.useState<string>("");
  const cemeteries: Cemetery[] | null = useSelector(selectAllCemeteries);
  const usersStatus = useSelector(getAllCemeteriesStatus);
  const error = useSelector(getAllCemeteriesError);
  const dispatch = useDispatch<any>();

  useEffect(() => {
    if (usersStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchCemeteries());
    }
  }, [usersStatus, dispatch]);

  const handleChangeCemetery = (event: SelectChangeEvent) => {
    setCemeteryId(event.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const obj = {
      cemeteryId,
      name,
      surname,
      birthYear: birthYear?.toString() || "",
      deathYearFrom: deathYearFrom?.toString() || "",
      deathYearTo: deathYearTo?.toString() || "",
    };

    const queryParams = new URLSearchParams({
      ...obj,
    }).toString();
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
            <InputLabel id="cemetery-select-label">{"Cemetery"}</InputLabel>
            <Select
              labelId="cemetery-select-label"
              id="demo-simple-select"
              value={cemeteryId}
              label="Cemetery"
              onChange={handleChangeCemetery}
            >
              {cemeteries?.map((cemetery) => (
                <MenuItem key={cemetery._id} value={cemetery._id}>
                  {cemetery.name}
                </MenuItem>
              ))}
            </Select>
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
