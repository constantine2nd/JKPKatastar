import CheckIcon from "@mui/icons-material/Check";
import { Autocomplete } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import DeceasedTableComponent from "../../components/DeceasedTableComponent";
import {
  fetchCemeteries,
  getAllCemeteriesError,
  getAllCemeteriesStatus,
  selectAllCemeteries,
} from "../../features/cemeteriesSlice";

const mobile = `"name"
"surname"
"cemetery"
"birth-year"
"death-year-from"
"death-year-to"
"button"`;

const desktop = `"name surname"
"cemetery cemetery"
"birth-year birth-year"
"death-year-from death-year-to"
"button button"`;

const DeceasedSearchScreen = () => {
  const { t, i18n } = useTranslation();
  const [cemeteryIds, setCemeteryIds] = React.useState("");
  const [name, setName] = React.useState("");
  const [surname, setSurname] = React.useState("");
  // const [birthYear, setBirthYear] = React.useState();
  const [deathDateFrom, setDeathDateFrom] = React.useState();
  const [deathDateTo, setDeathDateTo] = React.useState();
  const [birthDateFrom, setBirthDateFrom] = React.useState();
  const [birthDateTo, setBirthDateTo] = React.useState();
  const [showTable, setShowTable] = React.useState(false);
  const [path, setPath] = React.useState("");
  const cemeteries = useSelector(selectAllCemeteries);
  const usersStatus = useSelector(getAllCemeteriesStatus);
  const error = useSelector(getAllCemeteriesError);
  const dispatch = useDispatch();

  const mobileView = useMediaQuery("(max-width:600px)");

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

  const calculateGridTemplateAreas = () => {
    if (mobileView) {
      return mobile;
    } else {
      return desktop;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const obj = {
      cemeteryIds,
      name,
      surname,
      birthDateFrom: birthDateFrom?.$d?.toString() || "",
      birthDateTo: birthDateTo?.$d?.toString() || "",
      deathDateFrom: deathDateFrom?.$d?.toString() || "",
      deathDateTo: deathDateTo?.$d?.toString() || "",
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
      <Container component="main" maxWidth="sm">
        <Box
          component="form"
          id="serach-box"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            mt: 1,
            marginTop: 8,
            gap: "10px",
            display: "grid",
            flexWrap: "wrap",
            alignItems: "center",
            gridTemplateAreas: calculateGridTemplateAreas,
          }}
        >
          <TextField
            margin="normal"
            sx={{ gridArea: "name" }}
            required
            fullWidth
            id="name"
            label={t("name")}
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            margin="normal"
            sx={{ gridArea: "surname" }}
            required
            fullWidth
            id="surname"
            label={t("surname")}
            name="surname"
            autoComplete="surname"
            autoFocus
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />

          <FormControl margin="normal" fullWidth sx={{ gridArea: "cemetery" }}>
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
                  label={t("search-deceased.cemetery-selection")}
                  placeholder={t("search-deceased.cemetery-selection")}
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

          {/* <TextField
            margin="normal"
            sx={{ gridArea: "birth-year" }}
            required
            fullWidth
            name="birth-year"
            label={t("search-deceased.birth-year")}
            id="birth-year"
            autoComplete="birth-year"
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
          /> */}
          <DatePicker
            label={t("search-deceased.birth-date-from")}
            format="D/M/YYYY"
            value={birthDateFrom}
            onChange={(newValue) => setBirthDateFrom(newValue)}
          />
          <DatePicker
            label={t("search-deceased.birth-date-to")}
            format="D/M/YYYY"
            value={birthDateTo}
            onChange={(newValue) => setBirthDateTo(newValue)}
          />

          {/*  <TextField
            margin="normal"
            sx={{ gridArea: "death-year-from" }}
            required
            fullWidth
            name="death-year-from"
            label={t("search-deceased.death-year-from")}
            id="death-year-from"
            autoComplete="death-year-from"
            type="number"
            value={deathYearFrom}
            onChange={(e) => setDeathYearFrom(Number(e.target.value))}
          /> */}
          <DatePicker
            label={t("search-deceased.death-date-from")}
            format="D/M/YYYY"
            value={deathDateFrom}
            onChange={(newValue) => setDeathDateFrom(newValue)}
          />
          <DatePicker
            label={t("search-deceased.death-date-to")}
            format="D/M/YYYY"
            value={deathDateTo}
            onChange={(newValue) => setDeathDateTo(newValue)}
          />

          {/* <TextField
            margin="normal"
            sx={{ gridArea: "death-year-to" }}
            required
            fullWidth
            name="death-year-to"
            label={t("search-deceased.death-year-to")}
            id="death-year-to"
            autoComplete="death-year-to"
            type="number"
            value={deathYearTo}
            onChange={(e) => setDeathYearTo(Number(e.target.value))}
          /> */}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ gridArea: "button", mt: 3, mb: 2 }}
          >
            {t("search-deceased.search")}
          </Button>
        </Box>
      </Container>
      {showTable && <DeceasedTableComponent path={path} graveCapcity={6} />}
    </>
  );
};

export default DeceasedSearchScreen;
