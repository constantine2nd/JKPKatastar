import React, { useState, useEffect, useRef } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import axios from "axios";
import { Modal, Form, Row, Col, Button, Table } from "react-bootstrap";

import { dateFormatter } from "../utils/dateFormatter";
import "./GraveTableScreen.css";

interface GraveData {
  _id: string;
  number: string;
  field: string;
  row: string;
  capacity: string;
  contractTo: string;
  LAT: string;
  LON: string;
  numberOfDeceaseds: string;
}

const getRowStyling = (
  capacity: string,
  numberOfDeceaseds: string,
  contractTo: string
) => {
  let classString: string = "";
  let contractDate = new Date(contractTo);
  let contractDatePlus = new Date(contractTo);
  contractDatePlus.setMonth(contractDatePlus.getMonth() - 3);
  let today = new Date();
  if (Number(capacity) - Number(numberOfDeceaseds) === 0)
    classString += "capacity-row";
  if (today > contractDate) {
    classString += " contract-finished-row";
  } else if (today > contractDatePlus)
    classString += " contract-about-to-finish-row";

  return classString;
};

const GravesTableScreen: React.FC = () => {
  const [graves, setGraves] = useState<GraveData[]>([]);
  let navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/graves").then((item) => {
      console.log(item.data);
      setGraves(item.data);
    });
  }, []);

  return (
    <>
      <div
        style={{
          height: "50vw",
          width: "100%",
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>GravesTableScreen</div>
        {graves.length !== 0 && (
          <Table
            striped
            bordered
            hover
            style={{
              width: "70%",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "red",
                }}
              >
                <th>#</th>
                <th>Redni broj</th>
                <th>Polje</th>
                <th>Red</th>
                <th>Kapacitet</th>
                <th>Zauzetost</th>
                <th>Datum isteka ugovora</th>
                <th>LAT</th>
                <th>LON</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {graves.map((grave, index) => (
                <tr
                  key={index}
                  className={getRowStyling(
                    grave.capacity,
                    grave.numberOfDeceaseds,
                    grave.contractTo
                  )}
                >
                  <td>{index + 1}</td>
                  <td>{grave.number}</td>
                  <td>{grave.field}</td>
                  <td>{grave.row}</td>
                  <td>{grave.capacity}</td>
                  <td>{grave.numberOfDeceaseds}</td>
                  <td>{dateFormatter(grave.contractTo)}</td>
                  <td>{grave.LAT}</td>
                  <td>{grave.LON}</td>
                  <td>
                    <Button
                      onClick={() => {
                        navigate({
                          pathname: "/single-grave",
                          search: createSearchParams({
                            id: grave._id,
                          }).toString(),
                        });
                      }}
                    >
                      Detalji
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

export default GravesTableScreen;
