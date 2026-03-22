import React from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const MapComponent = (props) => {
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_KEY}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultZoom={18}
        defaultCenter={{ lat: props.LAT, lng: props.LON }}
        mapTypeId="satellite"
        mapId={process.env.REACT_APP_GOOGLE_MAP_ID}
        onDragend={() => props.captureMap && props.captureMap()}
        onCameraChanged={() => props.captureMap && props.captureMap()}
      >
        <AdvancedMarker position={{ lat: props.LAT, lng: props.LON }} />
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
