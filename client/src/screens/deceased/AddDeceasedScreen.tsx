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
import { useSelector, useDispatch } from "react-redux";
import { addDeacesed } from "../../features/singleGraveSlice";

interface FormData {
  name: string;
  surname: string;
  dateBirth: string;
  dateDeath: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Ime pokojnika je obavezno polje"),
  surname: Yup.string().required("Prezime pokojnika je obavezno polje"),
  dateBirth: Yup.string().required("Datum rodjenja je obavezno polje"),
  dateDeath: Yup.string().required("Datum smrti je obavezno polje"),
});

const AddGrave: React.FC = () => {
  const [searchParams] = useSearchParams();
  const graveId = searchParams.get("id");

  let navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const initialValues: FormData = {
    name: "",
    surname: "",
    dateBirth: "",
    dateDeath: "",
  };

  const handleSubmit = async (values: FormData) => {
    // Ovdje možete postaviti logiku za obradu podataka
    /* console.log("Podaci:", values);
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
    console.log(savedDeacesed); */
    if (graveId !== null) {
      dispatch(addDeacesed({ dataToSend: values, graveId }));
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
      <h1>Unesite pokojnika:</h1>
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
                    placeholder="Unesite prezime pokojnika"
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

export default AddGrave;
