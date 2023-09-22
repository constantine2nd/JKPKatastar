import React, { useState } from "react";
import axios from "axios";
import {
  useSearchParams,
  useNavigate,
  createSearchParams,
} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Container,
  Row,
  Col,
  Button,
  Form as BootstrapForm,
} from "react-bootstrap";

interface FormData {
  name: string;
  surname: string;
  address: string;
  phone: string;
  jmbg: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Ime platioca je obavezno polje"),
  surname: Yup.string().required("Prezime platioca je obavezno polje"),
  address: Yup.string().required("Red grobnog mesta je obavezno polje"),
  phone: Yup.string().required("Broj telefona je obavezno polje"),
  jmbg: Yup.string().required("JMBG je obavezno polje"),
});

const AddPayer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeChecked, setActiveChecked] = useState(true);
  const graveId = searchParams.get("id");

  let navigate = useNavigate();

  const initialValues: FormData = {
    name: "",
    surname: "",
    address: "",
    phone: "",
    jmbg: "",
  };

  const handleSubmit = async (values: FormData) => {
    // Ovdje možete postaviti logiku za obradu podataka
    const dataToSend = { ...values, active: activeChecked };

    console.log("Podaci:", dataToSend);
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const savedDeacesed = await axios.post(
      `/api/payer/${graveId}`,
      dataToSend,
      config
    );
    console.log(savedDeacesed);
    if (graveId !== null) {
      navigate({
        pathname: "/single-grave",
        search: createSearchParams({
          id: graveId,
        }).toString(),
      });
    }
  };

  return (
    <Container>
      <h1>Unesite platioca grobnog mesta:</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="name">
                  <BootstrapForm.Label>Ime:</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="name"
                    as={BootstrapForm.Control}
                    placeholder="Unesite ime platioca"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="surname">
                  <BootstrapForm.Label>Prezime:</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="surname"
                    as={BootstrapForm.Control}
                    placeholder="Unesite prezime platioca"
                  />
                  <ErrorMessage
                    name="surname"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="address">
                  <BootstrapForm.Label>Adresa:</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="address"
                    as={BootstrapForm.Control}
                    placeholder="Unesite adresu platioca"
                  />
                  <ErrorMessage
                    name="address"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="phone">
                  <BootstrapForm.Label>Broj telefona:</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="phone"
                    as={BootstrapForm.Control}
                    placeholder="Unesite broj telefona platioca"
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="jmbg">
                  <BootstrapForm.Label>JMBG:</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="jmbg"
                    as={BootstrapForm.Control}
                    placeholder="Unesite JMBG platioca"
                  />
                  <ErrorMessage
                    name="jmbg"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="active">
                  <BootstrapForm.Label>Platioc aktivan:</BootstrapForm.Label>
                  <BootstrapForm.Check
                    type="switch"
                    name="active"
                    checked={activeChecked}
                    label="Platioc aktivan:"
                    onChange={() => {
                      setActiveChecked(!activeChecked);
                    }}
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>

            <br />

            <Button type="submit" disabled={isSubmitting}>
              Pošalji
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default AddPayer;
