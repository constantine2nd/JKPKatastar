import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import {
  fetchCemeteries,
  selectAllCemeteries,
  getAllCemeteriesError,
  getAllCemeteriesStatus,
} from "../features/cemeteriesSlice";
import { resetGravesStatus } from "../features/gravesSlice";

import { Cemetery } from "../interfaces/CemeteryInterfaces";
import { getSelectedCemetery } from "../utils/cemeterySelector";

const LandingScreen: React.FC = () => {
  const cemeteries: Cemetery[] | null = useSelector(selectAllCemeteries);
  const [cemeteryId, setCemeteryId] = React.useState(getSelectedCemetery());
  const navigate = useNavigate();
  const { t } = useTranslation();

  const usersStatus = useSelector(getAllCemeteriesStatus);
  const error = useSelector(getAllCemeteriesError);
  const dispatch = useDispatch<any>();


  useEffect(() => {
    if (usersStatus === "idle") {
      dispatch(fetchCemeteries());
    }
  }, [usersStatus, dispatch]);

  const handleSelect = (cemetery: Cemetery) => {
    setCemeteryId(cemetery._id);
    localStorage.setItem("selected-cemetery", JSON.stringify(cemetery));
    dispatch(resetGravesStatus());
    navigate("/", { state: { cemetery } });
  };

  if (usersStatus === "loading") {
    return <Loader />;
  }

  if (usersStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {t("client.landing-page-screen")}
      </Typography>
      <Grid container spacing={2}>
        {cemeteries?.map((cemetery) => {
          const selected = cemetery._id === cemeteryId;
          return (
            <Grid item xs={12} sm={6} md={4} key={cemetery._id}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: selected ? "primary.main" : "divider",
                  borderWidth: selected ? 2 : 1,
                }}
              >
                <CardActionArea onClick={() => handleSelect(cemetery)}>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {cemetery.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default LandingScreen;
