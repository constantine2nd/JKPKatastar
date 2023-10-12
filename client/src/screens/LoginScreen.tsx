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
import { useSelector, useDispatch } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";

import { loginUser, getUserStatus, getUserError } from "../features/userSlice";

interface FormData {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().required("Ime je obavezno polje"),
  password: Yup.string().required("Password je obavezno polje"),
});

const UserLogin: React.FC = () => {
  const dispatch = useDispatch<any>();

  let navigate = useNavigate();
  const userStatus = useSelector(getUserStatus);
  const error = useSelector(getUserError);

  const initialValues: FormData = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values: FormData) => {
    console.log(values);
    dispatch(loginUser(values));
    // navigate("/");
  };

  if (userStatus === "loading") {
    return <Loader />;
  }

  if (userStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return (
    <Container>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="email">
                  <BootstrapForm.Label>Email:</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="email"
                    as={BootstrapForm.Control}
                    placeholder="Unesite ime"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-danger"
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapForm.Group controlId="password">
                  <BootstrapForm.Label>Password:</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="password"
                    as={BootstrapForm.Control}
                    placeholder="Unesite password"
                  />
                  <ErrorMessage
                    name="password"
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

export default UserLogin;
