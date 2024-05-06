import { useState, useEffect, ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StepLabel from "@mui/material/StepLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import useMediaQuery from "@mui/material/useMediaQuery";

import axios from "axios";

import { Cemetery } from "../../interfaces/CemeteryInterfaces";
import {
  fetchCemeteries,
  selectAllCemeteries,
} from "../../features/cemeteriesSlice";
import {
  fetchGravesForCemetary,
  selectAllGraves,
} from "../../features/gravesSlice";
import MapStepperComponent from "../../components/MapStepperComponent";
import { Grave } from "../../interfaces/GraveIntefaces";
import { composeErrorMessage } from "../../components/CommonFuntions";

const mapStyles = {
  width: "70%",
  height: "70%",
  position: "relative",
  top: "50px",
};

const iconBaseFree =
  "http://maps.google.com/mapfiles/kml/paddle/grn-blank-lv.png";
const iconBaseFull =
  "http://maps.google.com/mapfiles/kml/paddle/red-circle-lv.png";

const mobile = `
  "paper"
  "name"
  "surname"
  "email"
  "phone"
  "button"
  `;

const desktop = `"paper paper paper paper"
  "name name surname surname"
  "email email phone phone"
  ". button button ."`;

const GraveRequestStepperScreen: React.FC = () => {
  const mobileView = useMediaQuery("(max-width:600px)");
  const cemeteries: Cemetery[] | null = useSelector(selectAllCemeteries);
  const [selectedCemetery, setSelectedCemetery] = useState<Cemetery>();
  const [selectedGrave, setSelectedGrave] = useState<Grave>();
  const graves = useSelector(selectAllGraves);
  const [cemeteryId, setCemeteryId] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{
    [k: number]: boolean;
  }>({});
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const dispatch = useDispatch<any>();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    dispatch(fetchCemeteries());
  }, []);

  const handleStep = (step: number) => {
    console.log(step);
    setActiveStep(step);
  };

  const handleChangeCemetery = (event: SelectChangeEvent) => {
    const selectedCemeteryId = event.target.value;
    const foundSelectedCemetery = cemeteries?.find(
      (cem) => cem._id === selectedCemeteryId
    );
    setSelectedCemetery(foundSelectedCemetery);
    setCemeteryId(event.target.value);
    dispatch(fetchGravesForCemetary(selectedCemeteryId));
    setActiveStep(1);
  };

  const onClickGraveHandler = (grave: any) => {
    console.log(grave);
    if (grave.status === "FREE") {
      setSelectedGrave(grave);
      setActiveStep(2);
    }
  };

  const calculateGridTemplateAreas = () => {
    if (mobileView) {
      return mobile;
    } else {
      return desktop;
    }
  };

  const onSendGraveRequest = async () => {
    const path = `/api/grave-requests/addgraverequest`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const dataToSend = {
      graveId: selectedGrave?._id,
      name: name,
      surname: surname,
      email: email,
      phone: phone,
      status: "REQUSTED",
      createdAt: new Date(),
    };
    await axios
      .post(path, dataToSend, config)
      .then((response) => {
        setActiveStep(3);
        console.log(response.data);
      })
      .catch((error) => console.log(window.alert(composeErrorMessage(error))));
  };
  return (
    <>
      <Box sx={{ width: "100%", margin: "30px" }}>
        <Stepper nonLinear activeStep={activeStep} alternativeLabel>
          {/* {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton color="inherit" onClick={() => handleStep(index)}>
              <StepLabel>{label}</StepLabel>
            </StepButton>
          </Step>
        ))} */}
          <Step>
            <StepButton color="inherit" onClick={() => handleStep(0)}>
              <StepLabel>{"Izbor groblja"}</StepLabel>
            </StepButton>
          </Step>
          <Step>
            <StepButton color="inherit" onClick={() => handleStep(1)}>
              <StepLabel>{"Izbor grobnog mesta"}</StepLabel>
            </StepButton>
          </Step>
          <Step>
            <StepButton color="inherit" onClick={() => handleStep(2)}>
              <StepLabel>{"Forma za zahtev"}</StepLabel>
            </StepButton>
          </Step>
          <Step>
            <StepButton
              color="inherit"
              onClick={() => handleStep(3)}
              disabled={!(activeStep === 3)}
            >
              <StepLabel>{"Potvrda uspešnog zahteva"}</StepLabel>
            </StepButton>
          </Step>
        </Stepper>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {activeStep === 0 && (
          <Box sx={{ width: "50%", margin: "30px" }}>
            <FormControl fullWidth>
              <InputLabel id="cemetery-select-label">
                {t("Cemetery")}
              </InputLabel>
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
          </Box>
        )}
        {activeStep === 1 && selectedCemetery && graves && (
          <MapStepperComponent
            onClickHandler={onClickGraveHandler}
            selectedCemetery={selectedCemetery}
            graves={graves}
          />
        )}
        {activeStep === 2 && selectedGrave && (
          <>
            <Container
              component="main"
              sx={{
                display: "grid",
                gap: "10px",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "80%",
                gridTemplateAreas: calculateGridTemplateAreas,
              }}
            >
              <Paper
                square={false}
                sx={{
                  width: "100%",
                  marginTop: "20px",
                  p: 3,
                  gridArea: "paper",
                }}
              >
                <h4>
                  {t("number")}: {selectedGrave.number}
                </h4>
                <h4>
                  {t("row")}: {selectedGrave.row}
                </h4>
                <h4>
                  {t("field")}: {selectedGrave.field}
                </h4>
                <h4>
                  {t("capacity")}: {selectedGrave.graveType.capacity}
                </h4>
              </Paper>

              <TextField
                sx={{ gridArea: "name" }}
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
                sx={{ gridArea: "surname" }}
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
              <TextField
                sx={{ gridArea: "email" }}
                margin="normal"
                required
                fullWidth
                id="email"
                label={"email"}
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                sx={{ gridArea: "phone" }}
                margin="normal"
                required
                fullWidth
                id="phone"
                label={"phone"}
                name="phone"
                autoComplete="phone"
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{ gridArea: "button" }}
                onClick={onSendGraveRequest}
              >
                {"Send request"}
              </Button>
            </Container>
          </>
        )}
        {activeStep === 3 && (
          <Box sx={{ width: "50%", margin: "30px" }}>
            <h4>Vas zahtev za grobnim mestom je poslat</h4>
          </Box>
        )}
      </Box>
    </>
  );
};
export default GraveRequestStepperScreen;
