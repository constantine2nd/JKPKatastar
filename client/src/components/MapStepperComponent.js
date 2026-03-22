import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { Autocomplete } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllGraveTypes,
  selectAllGraveTypes,
} from "../features/graveTypesSlice";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const mapStyles = {
  width: "70%",
  height: "70%",
  minHeight: "500px",
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

  useEffect(() => {
    dispatch(getAllGraveTypes());
  }, [dispatch]);

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
              label="Tip grobnog mesta"
              placeholder="Tip grobnog mesta"
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
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_KEY}>
        <Map
          style={mapStyles}
          defaultZoom={props.selectedCemetery.zoom}
          defaultCenter={{
            lat: props.selectedCemetery.LAT,
            lng: props.selectedCemetery.LON,
          }}
          mapTypeId="satellite"
          mapId={process.env.REACT_APP_GOOGLE_MAP_ID}
          onCameraChanged={(ev) => setCurrentZoom(ev.detail.zoom)}
        >
          {props.graves
            .filter((grave) => {
              return (
                graveTypeIds.length === 0 ||
                graveTypeIds.some((id) => id === grave.graveType)
              );
            })
            .map((grave) => {
              const size = getSizeOfMarker(currentZoom);
              const iconUrl =
                grave.status !== "OCCUPIED" ? iconBaseFree : iconBaseFull;
              return (
                <AdvancedMarker
                  key={grave._id}
                  position={{ lat: grave.LAT, lng: grave.LON }}
                  onClick={() => props.onClickHandler(grave)}
                >
                  <img src={iconUrl} width={size} height={size} alt="" />
                </AdvancedMarker>
              );
            })}
        </Map>
      </APIProvider>
    </>
  );
};

export default MapStepperComponent;
