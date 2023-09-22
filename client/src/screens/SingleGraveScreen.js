import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  useNavigate,
  useSearchParams,
  createSearchParams,
} from "react-router-dom";
import { Modal, Form, Row, Col, Button, Table } from "react-bootstrap";
import { dateFormatter } from "../utils/dateFormatter";
import "./SingleGraveScreen.css";

const SingleGraveScreen = () => {
  const [searchParams] = useSearchParams();
  const graveId = searchParams.get("id");
  const [grave, setGrave] = useState(null);

  let navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/graves/${graveId}`).then((item) => {
      console.log(item.data);
      setGrave(item.data);
    });
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Podaci o pojedinacnom grobnom mestu</h2>
        {grave && (
          <Form>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Redni broj</Form.Label>
                  <Form.Control type="text" value={grave.number}></Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Polje</Form.Label>
                  <Form.Control type="text" value={grave.field}></Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Red</Form.Label>
                  <Form.Control type="text" value={grave.row}></Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Kapacitet</Form.Label>
                  <Form.Control
                    type="text"
                    value={grave.capacity}
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
        <br />
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
        <br />
        {grave && grave.deceased.length == 0 && (
          <h4>Na ovom grobnom mestu nema pokojnika</h4>
        )}

        {grave && grave.deceased.length !== 0 && (
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
              {grave &&
                grave.deceased.map((dec, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{dec.name}</td>
                    <td>{dec.surname}</td>
                    <td>{dateFormatter(dec.dateBirth)}</td>
                    <td>{dateFormatter(dec.dateDeath)}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

export default SingleGraveScreen;
