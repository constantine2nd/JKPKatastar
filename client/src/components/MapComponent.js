import React, { useState, useEffect, useRef } from "react";

import { Map, GoogleApiWrapper, Marker, Polygon } from "google-maps-react";

const mapStyles = {
  width: "100%",
  height: "100%",
};

const MapComponent = (props) => {
  //const mapRef = useRef(null);

  return (
    <>
      <Map
        containerStyle={mapStyles}
        //   ref={mapRef}
        zoom={18}
        google={props.google}
        initialCenter={{
          lat: props.LAT,
          lng: props.LON,
        }}
        mapType="satellite"
      >
        <Marker position={{ lat: props.LAT, lng: props.LON }} />
      </Map>
    </>
  );
};

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_KEY,
})(MapComponent);
