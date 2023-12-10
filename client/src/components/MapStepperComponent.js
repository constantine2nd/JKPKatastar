import React, { useState, useEffect, useRef } from "react";

import { Map, GoogleApiWrapper, Marker, Polygon } from "google-maps-react";

const mapStyles = {
  width: "70%",
  height: "70%",
  top: "250px",
  left: "220px",
};

const iconBaseFree =
  "http://maps.google.com/mapfiles/kml/paddle/grn-blank-lv.png";
const iconBaseFull =
  "http://maps.google.com/mapfiles/kml/paddle/red-circle-lv.png";

const getSizeOfMarker = (zoom) => {
  switch (zoom) {
    case 20:
      return 16;
    case 19:
      return 9;
    case 18:
      return 6;
    case 17:
      return 4;
    default:
      return 2;
  }
};

const MapStepperComponent = (props) => {
  const [currentZoom, setCurrentZoom] = useState(19);
  const mapRef = useRef(null);
  //const mapRef = useRef(null);
  useEffect(() => {
    if (mapRef.current) {
      // Dohvatite trenutni zoom nivo
      const newZoom = mapRef.current.map.getZoom();
      console.log(newZoom);
      setCurrentZoom(newZoom);

      // Dodajte slušač za promene zoom nivoa
      mapRef.current.map.addListener("zoom_changed", () => {
        const updatedZoom = mapRef.current.map.getZoom();
        console.log(updatedZoom);
        setCurrentZoom(updatedZoom);
      });
    }
  }, []);

  return (
    <>
      <Map
        containerStyle={mapStyles}
        ref={mapRef}
        zoom={props.selectedCemetery.zoom}
        google={props.google}
        initialCenter={{
          lat: props.selectedCemetery.LAT,
          lng: props.selectedCemetery.LON,
        }}
        mapType="satellite"
      >
        {props.graves.map((grave) => {
          const iconUrl =
            grave.capacity - grave.numberOfDeceaseds > 0
              ? iconBaseFree
              : iconBaseFull;
          return (
            <Marker
              key={grave._id}
              position={{ lat: grave.LAT, lng: grave.LON }}
              icon={{
                url: iconUrl,
                scaledSize: new props.google.maps.Size(
                  getSizeOfMarker(currentZoom),
                  getSizeOfMarker(currentZoom)
                ),
                rotation: 45,
              }}
              onClick={() => props.onClickHandler(grave)}
            />
          );
        })}
      </Map>
    </>
  );
};

export default GoogleApiWrapper({
  apiKey: "AIzaSyACV2yMJcx_aByY3PwY1b59WvppbM9_ovc",
})(MapStepperComponent);
