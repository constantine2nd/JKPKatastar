import React from "react";
import axios from "axios";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Container,
  Row,
  Col,
  Button,
  Form as BootstrapForm,
} from "react-bootstrap";
import { useNavigate, createSearchParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { addSingleGrave } from "../../features/gravesSlice";
import { useTranslation } from "react-i18next";
import { getSelectedCemetery } from "../../utils/cemeterySelector";

interface FormData {
  graveNumber: string;
  graveField: string;
  graveRow: string;
  graveCapacity: string;
  LAT1: string;
  LON1: string;
  contractTo: string;
  cemeteryId: string;
}

const AddGrave: React.FC = () => {

  const [selectedCemetery, setSelectedCemetery] = React.useState(getSelectedCemetery());
console.log(selectedCemetery._id)
  const initialValues: FormData = {
    graveNumber: "",
    graveField: "",
    graveRow: "",
    graveCapacity: "",
    LAT1: "",
    LON1: "",
    contractTo: "",
    cemeteryId: selectedCemetery._id,
  };

  let navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { t, i18n } = useTranslation();

  const validationSchema = Yup.object().shape({
    graveNumber: Yup.string().required(t("grave.occupation")),
    graveField: Yup.string().required(t("grave.field-mandatory")),
    graveRow: Yup.string().required(t("grave.row-mandatory")),
    graveCapacity: Yup.string().required(
      t("grave.capacity-mandatory")
    ),
    LAT1: Yup.string().required(t("grave.latitude-mandatory")),
    LON1: Yup.string().required(t("grave.longitude-mandatory")),
    contractTo: Yup.string().required(t("grave.contract-expiration-mandatory")),
  });

  const handleSubmit = async (values: FormData) => {
    // Ovdje možete postaviti logiku za obradu podataka
    /*  console.log("Podaci:", values);
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const savedGrave = await axios.post("/api/graves", values, config); */
    dispatch(addSingleGrave(values));
    navigate("/", { state: { sender: "ADDGraveSreen" } });
    //  console.log(savedGrave);
  };

  return (
    <Container>
      <h1>{t("grave.enter")}</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="graveNumber">
                  <BootstrapForm.Label>{t("grave.number-of")}</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveNumber"
                    as={BootstrapForm.Control}
                    placeholder={t("grave.enter-number")}
                  />
                  <ErrorMessage
                    name="graveNumber"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="graveField">
                  <BootstrapForm.Label>
                  {t("grave.field-of")}
                  </BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveField"
                    as={BootstrapForm.Control}
                    placeholder={t("grave.enter-field")}
                  />
                  <ErrorMessage
                    name="graveField"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="graveNumber">
                  <BootstrapForm.Label>{t("grave.row-of")}</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveRow"
                    as={BootstrapForm.Control}
                    placeholder={t("grave.enter-row")}
                  />
                  <ErrorMessage
                    name="graveRow"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="graveCapacity">
                  <BootstrapForm.Label>
                  {t("grave.capacity-of")}
                  </BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveCapacity"
                    as={BootstrapForm.Control}
                    placeholder={t("grave.enter-capacity")}
                  />
                  <ErrorMessage
                    name="graveCapacity"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="LAT1">
                  <BootstrapForm.Label>
                  {t("grave.latitude-of")}
                  </BootstrapForm.Label>
                  <Field
                    type="number"
                    name="LAT1"
                    as={BootstrapForm.Control}
                    placeholder={t("grave.enter-latitude")}
                    step="any"
                  />
                  <ErrorMessage
                    name="LAT1"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="LON1">
                  <BootstrapForm.Label>
                  {t("grave.longitude-of")}
                  </BootstrapForm.Label>
                  <Field
                    type="number"
                    name="LON1"
                    as={BootstrapForm.Control}
                    placeholder={t("grave.enter-longitude")}
                    step="any"
                  />
                  <ErrorMessage
                    name="LON1"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="contractTo">
                  <BootstrapForm.Label>
                  {t("grave.contract-expiration-date")}
                  </BootstrapForm.Label>
                  <Field
                    type="date"
                    name="contractTo"
                    as={BootstrapForm.Control}
                    placeholder={t("grave.enter-contract-expiration")}
                    step="any"
                  />
                  <ErrorMessage
                    name="contractTo"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col></Col>
            </Row>
            <br />
            <Row>
              <Col>
                <Button type="submit" disabled={isSubmitting}>
                {t("actions.send")}
                </Button>
              </Col>
              <Col>
                <Button
                  onClick={() => {
                    navigate({
                      pathname: "/graves-table",
                    });
                  }}
                >
                  {t("actions.back")}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default AddGrave;
