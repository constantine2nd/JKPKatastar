import React, { useState, useEffect } from "react";
import axios from "axios";
import MapComponent from "../components/MapComponent";
import OpenMapComponent from "../components/OpenMapComponent";

const Test3Screen = () => {
  return (
    <div>
      <h1>Test 3 Screen</h1>
      {/* <MapComponent /> */}
      <div
        style={{
          position: "relative",
          width: "700px",
          height: "700px",
          margin: "50px",
        }}
      >
        <OpenMapComponent LAT={45.395802265758846} LON={19.888156247897395} />
      </div>
    </div>
  );
};

export default Test3Screen;
