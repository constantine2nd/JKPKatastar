import React from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { Marker } from "react-leaflet/Marker";
import { TileLayer } from "react-leaflet/TileLayer";
import { Popup } from "react-leaflet/Popup";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

const position = [51.505, -0.09];

const OpenMapComponent = ({ LAT, LON }) => {
  const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/256/149/149060.png",
    iconSize: [36, 36],
  });
  return (
    <MapContainer center={[LAT, LON]} zoom={18} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[LAT, LON]} icon={customIcon}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default OpenMapComponent;
