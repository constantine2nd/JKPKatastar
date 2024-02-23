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
    graveNumber: Yup.string().required(t("occupation")),
    graveField: Yup.string().required(t("Field of grave is mandatory")),
    graveRow: Yup.string().required(t("Row of grave is mandatory")),
    graveCapacity: Yup.string().required(
      t("Capacity of grave is mandatory")
    ),
    LAT1: Yup.string().required(t("LATITUDE of grave is mandatory")),
    LON1: Yup.string().required(t("LONGITUDE of grave is mandatory")),
    contractTo: Yup.string().required(t("Expiration date of contract is mandatory")),
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
      <h1>{t("Enter the grave")}</h1>
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
                  <BootstrapForm.Label>{t("Number of grave")}</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveNumber"
                    as={BootstrapForm.Control}
                    placeholder={t("Enter the number of the grave")}
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
                  {t("Field of grave")}
                  </BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveField"
                    as={BootstrapForm.Control}
                    placeholder={t("Enter the field of the grave")}
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
                  <BootstrapForm.Label>{t("Row of grave")}</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveRow"
                    as={BootstrapForm.Control}
                    placeholder={t("Enter the row of the grave")}
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
                  {t("Capacity of grave")}
                  </BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveCapacity"
                    as={BootstrapForm.Control}
                    placeholder={t("Enter the capacity of the grave")}
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
                  {t("LATITUDE of grave")}
                  </BootstrapForm.Label>
                  <Field
                    type="number"
                    name="LAT1"
                    as={BootstrapForm.Control}
                    placeholder={t("Enter LATITUDE of the grave")}
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
                  {t("LONGITUDE of grave")}
                  </BootstrapForm.Label>
                  <Field
                    type="number"
                    name="LON1"
                    as={BootstrapForm.Control}
                    placeholder={t("Enter LONGITUDE of the grave")}
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
                  {t("contract-expiration-date")}
                  </BootstrapForm.Label>
                  <Field
                    type="date"
                    name="contractTo"
                    as={BootstrapForm.Control}
                    placeholder={t("Enter expiration date of contract")}
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
                {t("Send")}
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
                  {t("Back")}
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
