import React, { useState, useEffect, useRef } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import axios from "axios";
import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import { Map, GoogleApiWrapper, Marker } from "google-maps-react";

const mapStyles = {
  width: "70%",
  height: "70%",
  position: "relative",
  top: "50px",
};

const getSizeOfMarker = (zoom) => {
  switch (zoom) {
    case 20:
      return 16;
    case 19:
      return 9;
    case 18:
      return 6;
    case 17:
      return 4;
    default:
      return 2;
  }
};

const iconBaseFree =
  "http://maps.google.com/mapfiles/kml/paddle/grn-blank-lv.png";
const iconBaseFull =
  "http://maps.google.com/mapfiles/kml/paddle/red-circle-lv.png";

const HomeScreen = (props) => {
  const [graves, setGraves] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(19);
  const [selectedGrave, setSelectedGrave] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const mapRef = useRef(null);
  let navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/graves").then((item) => {
      console.log(item.data);
      setGraves(item.data);
    });
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      // Dohvatite trenutni zoom nivo
      const newZoom = mapRef.current.map.getZoom();
      console.log(newZoom);
      setCurrentZoom(newZoom);

      // Dodajte slušač za promene zoom nivoa
      mapRef.current.map.addListener("zoom_changed", () => {
        const updatedZoom = mapRef.current.map.getZoom();
        console.log(updatedZoom);
        setCurrentZoom(updatedZoom);
      });
    }
  }, []);

  const onClickHandler = (grave) => {
    setSelectedGrave(grave);
    setShowModal(true);
  };
  const onCloseHandler = () => {
    setShowModal(false);
    setSelectedGrave(null);
  };

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
        <div>Home Screen</div>
        <br />
        <Button
          onClick={() => {
            navigate({
              pathname: "/graves-table",
            });
          }}
        >
          Idi na tabelarni prikaz
        </Button>
        <br />

        <Map
          containerStyle={mapStyles}
          ref={mapRef}
          zoom={19}
          google={props.google}
          initialCenter={{ lat: 45.406017693851055, lng: 19.902106518542315 }}
          mapType="satellite"
        >
          {graves.map((grave) => {
            const iconUrl =
              grave.capacity - grave.numberOfDeceaseds > 0
                ? iconBaseFree
                : iconBaseFull;
            return (
              <Marker
                key={grave._id}
                position={{ lat: grave.LAT, lng: grave.LON }}
                icon={{
                  url: iconUrl,
                  scaledSize: new props.google.maps.Size(
                    getSizeOfMarker(currentZoom),
                    getSizeOfMarker(currentZoom)
                  ),
                  rotation: 45,
                }}
                onClick={() => onClickHandler(grave)}
              />
            );
          })}
        </Map>
        {selectedGrave && (
          <Modal show={showModal} onHide={onCloseHandler} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Informacije o grobnom mestu</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Redni broj</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedGrave.number}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Polje</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedGrave.field}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Red</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedGrave.row}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Kapacitet</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedGrave.capacity}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Zauzetost</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedGrave.numberOfDeceaseds}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Broj slobodnih mesta</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          selectedGrave.capacity -
                          selectedGrave.numberOfDeceaseds
                        }
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
              <Row>
                <Col>
                  <br />
                  <Button
                    onClick={() => {
                      navigate({
                        pathname: "/single-grave",
                        search: createSearchParams({
                          id: selectedGrave._id,
                        }).toString(),
                      });
                    }}
                  >
                    Detalji
                  </Button>
                </Col>
              </Row>
            </Modal.Body>
          </Modal>
        )}
      </div>
    </>
  );
};
export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_KEY,
})(HomeScreen);
