import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  useNavigate,
  useSearchParams,
  createSearchParams,
} from "react-router-dom";
import { Modal, Form, Row, Col, Button, Table } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";

import { dateFormatter } from "../utils/dateFormatter";
import "./SingleGraveScreen.css";
import {
  getGraveError,
  getGraveStatus,
  fetchSingleGrave,
  selectSingleGrave,
} from "../features/singleGraveSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";

import { Grave } from "../interfaces/GraveIntefaces";
import { useTranslation } from "react-i18next";

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

  const [searchParams] = useSearchParams();
  const graveId = searchParams.get("id");
  // const [grave, setGrave] = useState<Grave>();

  const { t, i18n } = useTranslation();

  let navigate = useNavigate();

  useEffect(() => {
    console.log(graveStatus);
    if (graveStatus === "idle") {
      console.log("UPAO");
      if (graveId) {
        dispatch(fetchSingleGrave(graveId));
      }
    }
  }, [graveStatus, dispatch]);

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Podaci o grobnom mestu</h2>
        {grave && (
          <Form>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>{t("number")}</Form.Label>
                  <Form.Control type="text" value={grave.number}></Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>{t("field")}</Form.Label>
                  <Form.Control type="text" value={grave.field}></Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>{t("row")}</Form.Label>
                  <Form.Control type="text" value={grave.row}></Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>{t("capacity")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={grave.capacity}
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>{t("LAT")}</Form.Label>
                  <Form.Control type="text" value={grave.LAT}></Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>{t("LON")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={grave.LON}
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <h2>
              {t("contract-expiration-date")}:{" "}
                <span className={getParagraphStyling(grave.contractTo)}>
                  {dateFormatter(grave.contractTo)}
                </span>
              </h2>
            </Row>
          </Form>
        )}
        <br />
        {grave && (
          <Row
            style={{
              width: "500px",
            }}
          >
            <Col className="button-add">
              <Button
                onClick={() => {
                  navigate({
                    pathname: "/add-deceased",
                    search: createSearchParams({
                      id: grave._id,
                    }).toString(),
                  });
                }}
                disabled={Number(grave.capacity) === grave.deceased.length}
              >
                Dodaj pokojnika
              </Button>
            </Col>
            <Col className="button-add">
              <Button
                onClick={() => {
                  navigate({
                    pathname: "/add-payer",
                    search: createSearchParams({
                      id: grave._id,
                    }).toString(),
                  });
                }}
              >
                Dodaj platioca
              </Button>
            </Col>
          </Row>
        )}
        <br />
        {grave && grave.deceased.length == 0 && (
          <h4>Na ovom grobnom mestu nema pokojnika</h4>
        )}

        {grave && grave.deceased.length !== 0 && (
          <>
            <h2>Lista pokojnika</h2>
            <Table
              striped
              bordered
              hover
              size="sm"
              style={{
                width: "70%",
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ime</th>
                  <th>Prezime</th>
                  <th>Datum rodjenja</th>
                  <th>Datum smrti</th>
                </tr>
              </thead>
              <tbody>
                {grave.deceased.map((dec, index, niz) => (
                  <tr key={dec._id}>
                    <td>{index + 1}</td>
                    <td>{dec.name}</td>
                    <td>{dec.surname}</td>
                    <td>{dateFormatter(dec.dateBirth)}</td>
                    <td>{dateFormatter(dec.dateDeath)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
        <br />
        {grave && grave.payers.length !== 0 && (
          <>
            <h2>Lista platioca</h2>
            <Table
              striped
              bordered
              hover
              size="sm"
              style={{
                width: "70%",
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ime</th>
                  <th>Prezime</th>
                  <th>Adresa</th>
                  <th>Telefon</th>
                  <th>JMBG</th>
                  <th>Aktivan</th>
                </tr>
              </thead>
              <tbody>
                {grave &&
                  grave.payers.map((payer, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{payer.name}</td>
                      <td>{payer.surname}</td>
                      <td>{payer.address}</td>
                      <td>{payer.phone}</td>
                      <td>{payer.jmbg}</td>
                      <td>{payer.active ? "DA" : "NE"}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </>
        )}
      </div>
    </>
  );
};

export default SingleGraveScreen;
