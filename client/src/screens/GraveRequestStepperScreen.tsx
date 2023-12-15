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
import { Map, GoogleApiWrapper, Marker, Polygon } from "google-maps-react";
import {
  Modal,
  Form,
  Row,
  Col,
  Button as BootstrapButton,
  Card,
} from "react-bootstrap";
import axios from "axios";

import { Cemetery } from "../interfaces/CemeteryInterfaces";
import {
  fetchCemeteries,
  selectAllCemeteries,
  getAllCemeteriesError,
  getAllCemeteriesStatus,
} from "../features/cemeteriesSlice";
import {
  getGravesError,
  getGravesStatus,
  fetchGravesForCemetary,
  selectAllGraves,
} from "../features/gravesSlice";
import MapStepperComponent from "../components/MapStepperComponent";
import { Grave } from "../interfaces/GraveIntefaces";

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

const GraveRequestStepperScreen: React.FC = () => {
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
    setSelectedGrave(grave);
    setActiveStep(2);
  };

  const onSendGraveRequest = async () => {
    const path = `/api/grave-requests/addgraverequest`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const dataToSend = {
      grave: selectedGrave?._id,
      name: name,
      surname: surname,
      email: email,
      phone: phone,
      status: "REQUSTED",
      createdAt: new Date(),
    };
    const response = await axios.post(path, dataToSend, config);
    console.log(response.data);
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
            <Card style={{ width: "60%", marginTop: "20px" }}>
              <Card.Body>
                <Card.Title>Podaci o grobnom mestu</Card.Title>
                <Row>
                  <Col>
                    <h4>
                      {t("number")}: {selectedGrave.number}
                    </h4>
                  </Col>
                  <Col>
                    <h4>
                      {t("field")}: {selectedGrave.field}
                    </h4>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h4>
                      {t("row")}: {selectedGrave.row}
                    </h4>
                  </Col>
                  <Col>
                    <h4>
                      {t("capacity")}: {selectedGrave.graveType.capacity}
                    </h4>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            <FormControl>
              <InputLabel htmlFor="my-input-name">Name</InputLabel>
              <Input
                id="my-input-name"
                aria-describedby="my-helper-text-name"
                value={name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setName(event.target.value)
                }
              />
              <FormHelperText id="my-helper-text-name">
                Please enter your name.
              </FormHelperText>
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="my-input-surname">Surname</InputLabel>
              <Input
                id="my-input-surname"
                aria-describedby="my-helper-text-surname"
                value={surname}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSurname(event.target.value)
                }
              />
              <FormHelperText id="my-helper-text-surname">
                Please enter your suname.
              </FormHelperText>
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="my-input-email">Email address</InputLabel>
              <Input
                id="my-input-email"
                aria-describedby="my-helper-text-email"
                value={email}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(event.target.value)
                }
              />
              <FormHelperText id="my-helper-text-email">
                Please enter your email.
              </FormHelperText>
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="my-input-phone">Phone number</InputLabel>
              <Input
                id="my-input-phone"
                aria-describedby="my-helper-text-phone"
                value={phone}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPhone(event.target.value)
                }
              />
              <FormHelperText id="my-helper-text-phone">
                Please enter your suname phone number.
              </FormHelperText>
            </FormControl>
            <BootstrapButton onClick={onSendGraveRequest}>
              Send request
            </BootstrapButton>
          </>
        )}
      </Box>
    </>
  );
};
export default GraveRequestStepperScreen;
