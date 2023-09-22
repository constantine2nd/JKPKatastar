import React from 'react';
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Button, Form as BootstrapForm } from 'react-bootstrap';

interface FormData {
  graveNumber: string;
  graveField: string;
  graveRow: string;
  graveCapacity: string;
  LAT1: string;
  LON1: string;
}

const validationSchema = Yup.object().shape({
  graveNumber: Yup.string().required('Broj grobnog mesta je obavezno polje'),
  graveField: Yup.string().required('Polje grobnog mesta je obavezno polje'),
  graveRow: Yup.string().required('Red grobnog mesta je obavezno polje'),
  graveCapacity: Yup.string().required('Kapacitet grobnog mesta je obavezno polje'),
  LAT1: Yup.string().required('LATITUDE grobnog mesta je obavezno polje'),
  LON1: Yup.string().required('LONGITUDE grobnog mesta je obavezno polje'),
});

const AddGrave: React.FC = () => {
  const initialValues: FormData = {
    graveNumber: '',
    graveField: '',
    graveRow: '',
    graveCapacity: '',
    LAT1: '',
    LON1: ''
  };

  const handleSubmit = async (values: FormData) => {
    // Ovdje možete postaviti logiku za obradu podataka
    console.log('Podaci:', values);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const savedGrave = await axios.post('/api/graves', values, config)
    console.log(savedGrave);
  };

  return (
    <Container>
      <h1>Unesite grobno mesto:</h1>
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
                  <BootstrapForm.Label>Broj grobnog mesta:</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveNumber"
                    as={BootstrapForm.Control}
                    placeholder="Unesite broj grobnog mesta"
                  />
                  <ErrorMessage name="graveNumber" component="div" className="text-danger" />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="graveField">
                  <BootstrapForm.Label>Polje grobnog mesta:</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveField"
                    as={BootstrapForm.Control}
                    placeholder="Unesite polje grobnog mesta"
                  />
                  <ErrorMessage name="graveField" component="div" className="text-danger" />
                </BootstrapForm.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="graveNumber">
                  <BootstrapForm.Label>Red grobnog mesta:</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveRow"
                    as={BootstrapForm.Control}
                    placeholder="Unesite red grobnog mesta"
                  />
                  <ErrorMessage name="graveRow" component="div" className="text-danger" />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="graveCapacity">
                  <BootstrapForm.Label>Kapacitet grobnog mesta:</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="graveCapacity"
                    as={BootstrapForm.Control}
                    placeholder="Unesite kapacitet grobnog mesta"
                  />
                  <ErrorMessage name="graveCapacity" component="div" className="text-danger" />
                </BootstrapForm.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="LAT1">
                  <BootstrapForm.Label>LATITUDE grobnog mesta:</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="LAT1"
                    as={BootstrapForm.Control}
                    placeholder="Unesite LATITUDE grobnog mesta"
                    step='any'
                  />
                  <ErrorMessage name="LAT1" component="div" className="text-danger" />
                </BootstrapForm.Group>
              </Col>
              <Col>
                <BootstrapForm.Group controlId="LON1">
                  <BootstrapForm.Label>LONGITUDE grobnog mesta:</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="LON1"
                    as={BootstrapForm.Control}
                    placeholder="Unesite LONGITUDE grobnog mesta"
                    step='any'
                  />
                  <ErrorMessage name="LON1" component="div" className="text-danger" />
                </BootstrapForm.Group>
              </Col>
            </Row>
            <br/>
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
