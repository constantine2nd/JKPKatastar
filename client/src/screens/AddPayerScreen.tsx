import React from "react";
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
  dateBirth: string;
  dateDeath: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Broj grobnog mesta je obavezno polje"),
  surname: Yup.string().required("Polje grobnog mesta je obavezno polje"),
  dateBirth: Yup.string().required("Red grobnog mesta je obavezno polje"),
  dateDeath: Yup.string().required("Kapacitet grobnog mesta je obavezno polje"),
});

const AddPayer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const graveId = searchParams.get("id");

  let navigate = useNavigate();

  const initialValues: FormData = {
    name: "",
    surname: "",
    dateBirth: "",
    dateDeath: "",
  };

  const handleSubmit = async (values: FormData) => {
    // Ovdje možete postaviti logiku za obradu podataka
    console.log("Podaci:", values);
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const savedDeacesed = await axios.post(
      `/api/deacesed/${graveId}`,
      values,
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
                    placeholder="Unesite ime pokojnika"
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
                    placeholder="Unesite polje grobnog mesta"
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
                <BootstrapForm.Group controlId="dateBirth">
                  <BootstrapForm.Label>Datum rodjenja:</BootstrapForm.Label>
                  <Field
                    type="date"
                    name="dateBirth"
                    as={BootstrapForm.Control}
                    placeholder="Unesite datum rodjenja pokojnika"
                  />
                  <ErrorMessage
                    name="dateBirth"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="dateDeath">
                  <BootstrapForm.Label>
                    Kapacitet grobnog mesta:
                  </BootstrapForm.Label>
                  <Field
                    type="date"
                    name="dateDeath"
                    as={BootstrapForm.Control}
                    placeholder="Unesite datum smrti pokojnika"
                  />
                  <ErrorMessage
                    name="dateDeath"
                    component="div"
                    className="text-danger"
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
