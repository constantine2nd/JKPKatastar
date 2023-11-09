import React from "react";
import "./App.css";
import Header from "./components/Header";
import { Route, Routes } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import AddGraveScreen from "./screens/AddGraveScreen";
import AddDeceasedScreen from "./screens/AddDeceasedScreen";
import AddPayerScreen from "./screens/AddPayerScreen";
import SingleGraveScreen from "./screens/SingleGraveScreen";
import GravesTableScreen from "./screens/GravesTableScreen";
import AddUserScreen from "./screens/AddUserScreen";
import LoginScreen from "./screens/LoginScreen";
import UsersTableScreen from "./screens/UsersTableScreen";
import UsersTableScreenCrudWithProviders from "./screens/UsersTableScreenCrud";
import DeceasedTableScreen from "./screens/DeceasedTableScreen";
import LandingScreen from "./screens/LandingScreen";

//Date Picker Imports - these should just be in your Context Provider
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import CemeteriesTableScreenCrud from "./screens/CemeteriesTableScreenCrud";
import GraveTypesTableScreen from "./screens/GraveTypesTableScreen";

function App() {
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/landing" element={<LandingScreen />} />
            <Route path="/add-grave" element={<AddGraveScreen />} />
            <Route path="/single-grave" element={<SingleGraveScreen />} />
            <Route path="/add-deceased" element={<AddDeceasedScreen />} />
            <Route path="/add-payer" element={<AddPayerScreen />} />
            <Route path="/add-user" element={<AddUserScreen />} />
            <Route path="/login-user" element={<LoginScreen />} />
            <Route path="/graves-table" element={<GravesTableScreen />} />
            <Route path="/deceased-table" element={<DeceasedTableScreen />} />
            <Route path="/users-table" element={<UsersTableScreen />} />
            <Route
              path="/users-table-crud"
              element={<UsersTableScreenCrudWithProviders />}
            />
            <Route
              path="/cemeteries-table-crud"
              element={<CemeteriesTableScreenCrud />}
            />
          </Routes>
          <Route
            path="/grave-types-table"
            element={<GraveTypesTableScreen />}
          />
        </main>
      </LocalizationProvider>
    </>
  );
}

export default App;
