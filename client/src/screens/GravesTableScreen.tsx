import React, { useState, useEffect, useRef } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import axios from "axios";
import { Modal, Form, Row, Col, Button, Table } from "react-bootstrap";

import { dateFormatter } from "../utils/dateFormatter";
import {
  selectAllGraves,
  fetchGraves,
  getGravesStatus,
  getGravesError,
  deleteSingleGrave,
} from "../features/gravesSlice";
import "./GraveTableScreen.css";
import { GraveData } from "../interfaces/GraveIntefaces";
import Loader from "../components/Loader";
import Message from "../components/Message";

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
  //const [graves, setGraves] = useState<GraveData[]>([]);
  let navigate = useNavigate();
  const graves: GraveData[] = useSelector(selectAllGraves);
  const gravesStatus = useSelector(getGravesStatus);
  const error = useSelector(getGravesError);
  const dispatch = useDispatch<any>();
  const [showModal, setShowModal] = useState(false);
  const [selectedGraveId, setSelectedGraveId] = useState<string>();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (gravesStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchGraves());
    }
  }, [gravesStatus, dispatch]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGraveId("");
  };

  const handleShowModal = (id: string) => {
    setSelectedGraveId(id);
    setShowModal(true);
  };

  const handleDeleteGrave = () => {
    if (selectedGraveId) {
      dispatch(deleteSingleGrave(selectedGraveId));
      setShowModal(false);
    }
  };

  if (gravesStatus === "loading") {
    return <Loader />;
  }

  if (gravesStatus === "failed") {
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
          height: "50vw",
          width: "100%",
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>GravesTableScreen</div>
        <br />
        <Button
          onClick={() => {
            navigate({
              pathname: "/add-grave",
            });
          }}
        >
          {t("add grave")}
        </Button>
        <br />
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
                <th>{t("number")}</th>
                <th>{t("field")}</th>
                <th>{t("row")}</th>
                <th>{t("capacity")}</th>
                <th>{t("occupation")}</th>
                <th>{t("contract-expiration-date")}</th>
                <th>LAT</th>
                <th>LON</th>
                <th>#</th>
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
                      {t("details")}
                    </Button>
                  </td>
                  <td>
                    <Button onClick={() => handleShowModal(grave._id)}>
                      {t("delete")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Brisanje grobnog mesta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Da li ste sigurni da zelite da izbrisete grobno mesto?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Nazad
          </Button>
          <Button variant="primary" onClick={handleDeleteGrave}>
            Da
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GravesTableScreen;
