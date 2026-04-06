import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import {
  Form as BootstrapForm,
  Button,
  Col,
  Container,
  Row,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

import { addPayer } from "../../features/singleGraveSlice";

interface FormData {
  name: string;
  surname: string;
  address: string;
  phone: string;
  jmbg: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required(t("form.name-required")),
  surname: Yup.string().required(t("form.surname-required")),
  address: Yup.string().required(t("form.address-required")),
  phone: Yup.string().required(t("form.phone-required")),
  jmbg: Yup.string(),
});

const AddPayer: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeChecked, setActiveChecked] = useState(true);
  const graveId = searchParams.get("common.id");

  const dispatch = useDispatch<any>();

  let navigate = useNavigate();

  const initialValues: FormData = {
    name: "",
    surname: "",
    address: "",
    phone: "",
    jmbg: "",
  };

  const handleSubmit = async (values: FormData) => {
    const dataToSend = { ...values, active: activeChecked };

    if (graveId !== null) {
      dispatch(addPayer({ dataToSend, graveId }));
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
      <h1>{t("payer.create-new")}</h1>
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
                  <BootstrapForm.Label>{t("form.name")}</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="name"
                    as={BootstrapForm.Control}
                    placeholder={t("form.name")}
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
                  <BootstrapForm.Label>{t("form.surname")}</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="surname"
                    as={BootstrapForm.Control}
                    placeholder={t("form.surname")}
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
                  <BootstrapForm.Label>{t("form.address")}</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="address"
                    as={BootstrapForm.Control}
                    placeholder={t("form.address")}
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
                  <BootstrapForm.Label>{t("form.phone")}</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="phone"
                    as={BootstrapForm.Control}
                    placeholder={t("form.phone")}
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
                  <BootstrapForm.Label>{t("form.jmbg")}</BootstrapForm.Label>
                  <Field
                    type="text"
                    name="jmbg"
                    as={BootstrapForm.Control}
                    placeholder={t("form.jmbg")}
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
                  <BootstrapForm.Check
                    type="switch"
                    name="active"
                    checked={activeChecked}
                    label={t("payer.active")}
                    onChange={() => {
                      setActiveChecked(!activeChecked);
                    }}
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>

            <br />

            <Button type="submit" disabled={isSubmitting}>
              {t("actions.send")}
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default AddPayer;
