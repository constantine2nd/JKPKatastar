import React, { useState, useEffect, useRef } from "react";
import TextField, { OutlinedTextFieldProps } from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { Autocomplete, AutocompleteRenderInputParams } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllGraveTypes,
  selectAllGraveTypes,
} from "../features/graveTypesSlice";

import {
  Map,
  GoogleApiWrapper,
  Marker,
  Polygon,
  InfoWindow,
} from "google-maps-react";

const mapStyles = {
  width: "70%",
  height: "70%",
  top: "350px",
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
  const [graveTypeIds, setGraveTypeIds] = useState([]);
  const graveTypes = useSelector(selectAllGraveTypes);
  const dispatch = useDispatch();
  const mapRef = useRef(null);

  useEffect(() => {
    dispatch(getAllGraveTypes());
  }, []);
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

  const handleChangeGraveType = (event, value) => {
    let slelectedGraveTypeIds = value.map((graveType) => graveType._id);
    setGraveTypeIds(slelectedGraveTypeIds);
  };

  return (
    <>
      <FormControl
        margin="normal"
        fullWidth
        sx={{ gridArea: "cemetery", width: "400px" }}
      >
        <Autocomplete
          onChange={handleChangeGraveType}
          multiple
          options={graveTypes}
          getOptionLabel={(option) => `${option.name} - ${option.description}`}
          disableCloseOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Multiple Autocomplete"
              placeholder="Multiple Autocomplete"
            />
          )}
          renderOption={(props, option, { selected }) => (
            <MenuItem
              {...props}
              key={option._id}
              value={option._id}
              sx={{ justifyContent: "space-between" }}
            >
              {option.name} - {option.description}
              {selected ? <CheckIcon color="info" /> : null}
            </MenuItem>
          )}
        />
      </FormControl>
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
        {props.graves
          .filter((grave) => {
            return (
              graveTypeIds.length === 0 ||
              graveTypeIds.some((id) => id === grave.graveType)
            );
          })
          .map((grave) => {
            const iconUrl =
              grave.status !== "OCCUPIED" ? iconBaseFree : iconBaseFull;
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
              >
                <InfoWindow>
                  <h4>{"info"}</h4>
                </InfoWindow>
              </Marker>
            );
          })}
      </Map>
    </>
  );
};

export default GoogleApiWrapper({
  apiKey: "AIzaSyACV2yMJcx_aByY3PwY1b59WvppbM9_ovc",
})(MapStepperComponent);
