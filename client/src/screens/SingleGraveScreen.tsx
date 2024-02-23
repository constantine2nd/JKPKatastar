import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {
  useNavigate,
  useSearchParams,
  createSearchParams,
} from "react-router-dom";
import {
  Modal,
  Form,
  Row,
  Col,
  Button as BootstrapButton,
  Card,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";

import { PDFDownloadLink, usePDF } from "@react-pdf/renderer";
import PDFRenderer from "./../components/PDFRenderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  pdf,
} from "@react-pdf/renderer";

import { dateFormatter } from "../utils/dateFormatter";
import "./SingleGraveScreen.css";
import {
  getGraveError,
  getGraveStatus,
  fetchSingleGrave,
  selectSingleGrave,
  deletePayer,
  deleteDeceased,
} from "../features/singleGraveSlice";
import { selectUser } from "../features/userSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import MapComponent from "../components/MapComponent";
import OpenMapComponent from "../components/OpenMapComponent";
import PayersTableScreenCrud from "./PayersTableScreenCrud";

import { Grave } from "../interfaces/GraveIntefaces";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import DeceasedTableScreenCrud from "./DeceasedTableScreenCrud";

const getParagraphStyling = (contractTo: string) => {
  let classString = "";
  let contractDate = new Date(contractTo);
  let contractDatePlus = new Date(contractTo);
  contractDatePlus.setMonth(contractDatePlus.getMonth() - 3);
  let today = new Date();
  if (today > contractDate) {
    classString += " contract-finished-row";
  } else if (today > contractDatePlus)
    classString += " contract-about-to-finish-row";

  return classString;
};

const SingleGraveScreen: React.FC = () => {
  const dispatch = useDispatch<any>();
  const grave = useSelector(selectSingleGrave);
  const graveStatus = useSelector(getGraveStatus);
  const error = useSelector(getGraveError);
  const user = useSelector(selectUser);
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [searchParams] = useSearchParams();
  const graveId = searchParams.get("id");

  const { t, i18n } = useTranslation();

  const generatePDF = () => {
    const mapElement = document.getElementById("map-cont");
    //  console.log(mapElement);

    if (mapElement && grave) {
      //setShowButton(false);
      html2canvas(mapElement, { useCORS: true }).then(async (canvas) => {
        const mapImageUrl = canvas.toDataURL("image/png");

        const pdfBlob = await pdf(
          <PDFRenderer grave={grave} mapImageUrl={mapImageUrl} />
        ).toBlob();

        const pdfUrl = URL.createObjectURL(pdfBlob);
        // Kreiranje i simulacija klika na skriveni link za download
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = pdfUrl;
        a.download = "example.pdf";
        // Dodavanje linka u dokument i simulacija klika
        document.body.appendChild(a);
        a.click();
        // Oslobađanje resursa
        document.body.removeChild(a);
        URL.revokeObjectURL(pdfUrl);
      });
    }

    // Kreiranje instance PDF-a

    // Kreiranje Blob objekta za PDF

    // Kreiranje URL-a za Blob objekat
  };

  useEffect(() => {
    if (graveId) {
      dispatch(fetchSingleGrave(graveId));
    }
  }, [graveId, dispatch]);

  if (graveStatus === "loading") {
    return <Loader />;
  }

  if (graveStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return (
    <>
      <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Podaci o grobnom mestu" />
          <Tab label="Lista pokojnika" />
          <Tab label="Lista platioca" />
        </Tabs>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {grave && value === 0 && (
          <Card style={{ width: "60%", marginTop: "20px" }}>
            <Card.Body>
              <Card.Title>Podaci o grobnom mestu</Card.Title>
              <Row>
                <Col>
                  <h3>
                    {t("number")}: {grave.number}
                  </h3>
                </Col>
                <Col>
                  <h3>
                    {t("field")}: {grave.field}
                  </h3>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h3>
                    {t("row")}: {grave.row}
                  </h3>
                </Col>
                <Col>
                  <h3>
                    {t("capacity")}: {grave.graveType.capacity}
                  </h3>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h3>
                    {t("LAT")}: {grave.LAT}
                  </h3>
                </Col>
                <Col>
                  <h3>
                    {t("LON")}: {grave.LON}
                  </h3>
                </Col>
              </Row>
              <Row>
                <div className="map-container" id="map-cont">
                  <OpenMapComponent
                    LAT={Number(grave?.LAT)}
                    LON={Number(grave?.LON)}
                  />
                </div>
              </Row>
              <Row>
                <Col>
                  <BootstrapButton
                    variant="success"
                    onClick={() => {
                      generatePDF();
                    }}
                  >
                    Download pdf
                  </BootstrapButton>
                </Col>
                <Col>
                  <h3>
                    {t("contract-expiration-date")}:{" "}
                    <span className={getParagraphStyling(grave.contractTo)}>
                      {dateFormatter(grave.contractTo)}
                    </span>
                  </h3>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
        {grave && grave.deceased.length == 0 && value === 1 && (
          <h4>Na ovom grobnom mestu nema pokojnika</h4>
        )}
        {grave && value === 1 && (
          <DeceasedTableScreenCrud
            graveId={grave._id}
            graveCapcity={Number(grave.graveType.capacity)}
          />
        )}
        {grave && value === 2 && <PayersTableScreenCrud graveId={grave._id} />}
      </Box>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          Podaci o grobnom mestu
        </AccordionSummary>
        <AccordionDetails>
          {grave && (
            <Card style={{ width: "60%", marginTop: "20px" }}>
              <Card.Body>
                <Card.Title>Podaci o grobnom mestu</Card.Title>
                <Row>
                  <Col>
                    <h3>
                      {t("number")}: {grave.number}
                    </h3>
                  </Col>
                  <Col>
                    <h3>
                      {t("field")}: {grave.field}
                    </h3>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h3>
                      {t("row")}: {grave.row}
                    </h3>
                  </Col>
                  <Col>
                    <h3>
                      {t("capacity")}: {grave.graveType.capacity}
                    </h3>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h3>
                      {t("LAT")}: {grave.LAT}
                    </h3>
                  </Col>
                  <Col>
                    <h3>
                      {t("LON")}: {grave.LON}
                    </h3>
                  </Col>
                </Row>
                <Row>
                  <div className="map-container" id="map-cont">
                    <OpenMapComponent
                      LAT={Number(grave?.LAT)}
                      LON={Number(grave?.LON)}
                    />
                  </div>
                </Row>
                <Row>
                  <Col>
                    <BootstrapButton
                      variant="success"
                      onClick={() => {
                        generatePDF();
                      }}
                    >
                      Download pdf
                    </BootstrapButton>
                  </Col>
                  <Col>
                    <h3>
                      {t("contract-expiration-date")}:{" "}
                      <span className={getParagraphStyling(grave.contractTo)}>
                        {dateFormatter(grave.contractTo)}
                      </span>
                    </h3>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          Lista pokojnika
        </AccordionSummary>
        <AccordionDetails>
          {grave && grave.deceased.length == 0 && (
            <h4>Na ovom grobnom mestu nema pokojnika</h4>
          )}
          {grave && (
            <DeceasedTableScreenCrud
              graveId={grave._id}
              graveCapcity={Number(grave.graveType.capacity)}
            />
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          Lista platioca
        </AccordionSummary>
        <AccordionDetails>
          {grave && <PayersTableScreenCrud graveId={grave._id} />}
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default SingleGraveScreen;
