import React from "react";
import { Spinner } from "react-bootstrap";
import "./Loader.css";
const Loader = () => {
  return (
    <Spinner
      animation="border"
      role="status"
      variant="success"
      className="loader"
    ></Spinner>
  );
};

export default Loader;
