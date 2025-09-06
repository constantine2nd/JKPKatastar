import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import HomeScreen from "./screens/HomeScreen";
import LandingScreen from "./screens/LandingScreen";
import AddDeceasedScreen from "./screens/deceased/AddDeceasedScreen";
import DeceasedTableScreen from "./screens/deceased/DeceasedTableScreen";

import GravesTableScreen from "./screens/grave/GravesTableScreen";
import SingleGraveScreen from "./screens/grave/SingleGraveScreen";
import AddPayerScreen from "./screens/payer/AddPayerScreen";
import AddUserScreenMUI from "./screens/user/AddUserScreenMUI";
import UsersTableScreenCrudWithProviders from "./screens/user/UsersTableScreenCrud";
import UsersTableScreen from "./screens/user/old/UsersTableScreen";

//Date Picker Imports - these should just be in your Context Provider
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import CemeteriesTableScreenCrud from "./screens/CemeteriesTableScreenCrud";
import DeceasedSearchScreen from "./screens/deceased/DeceasedSearchScreen";
import GravesTableScreenCrudWithProviders from "./screens/grave/GravesTableScreenCrud";
import GraveRequestStepperScreen from "./screens/graverequest/GraveRequestStepperScreen";
import GraveRequestTableScreenCrud from "./screens/graverequest/GraveRequestTableScreenCrud";
import GraveTypesTableScreen from "./screens/gravetype/GraveTypesTableScreen";
import GraveTypesTableScreenCrud from "./screens/gravetype/GraveTypesTableScreenCrud";
import ExcelToJsonConverterScreen from "./screens/importdata/ConvertExcelScreen";
import ExcelToJsonConverterOnlyGraves from "./screens/importdata/ConvertExcelScreenOnlyGraves";
import Test2Screen from "./screens/test/Test2Screen";
import Test3Screen from "./screens/test/Test3Screen";
import TestScreen from "./screens/test/TestScreen.js";
import EmailVerificationScreen from "./screens/user/EmailVerificationScreen";
import LoginScreenMUI from "./screens/user/LoginScreenMUI";
import ResetPasswordInitiation from "./screens/user/ResetPasswordInitiationScreen";
import ResetPassword from "./screens/user/ResetPasswordScreen";
import AddGraveScreenMUI from "./screens/grave/AddGraveScreenMUI";

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

function App() {
  // Get the last user selection if any otherwise use light theme
  const defaultMode: "light" | "dark" =
    localStorage.getItem("color-mode") === "dark" ? "dark" : "light";
  const [mode, setMode] = React.useState<"light" | "dark">(defaultMode);
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const mode = prevMode === "light" ? "dark" : "light";
          // Set the last user selection
          localStorage.setItem("color-mode", mode);
          return mode;
        });
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );
  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/landing" element={<LandingScreen />} />
                <Route path="/single-grave" element={<SingleGraveScreen />} />
                <Route path="/login-user" element={<LoginScreenMUI />} />
                <Route path="/graves-table" element={<GravesTableScreen />} />
                <Route
                  path="/search-deceased"
                  element={<DeceasedSearchScreen />}
                />
                <Route
                  path="/graves-table-crud"
                  element={<GravesTableScreenCrudWithProviders />}
                />
                <Route
                  path="/deceased-table"
                  element={<DeceasedTableScreen />}
                />
                <Route
                  path="/grave-requests-stepper"
                  element={<GraveRequestStepperScreen />}
                />
                <Route
                  path="/excel-to-json"
                  element={<ExcelToJsonConverterScreen />}
                />
                <Route
                  path="/excel-to-json-only-graves"
                  element={<ExcelToJsonConverterOnlyGraves />}
                />
                <Route
                  path="/verify-email"
                  element={<EmailVerificationScreen />}
                />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/reset-password-initiation"
                  element={<ResetPasswordInitiation />}
                />
                <Route path="/test" element={<TestScreen />} />
                <Route path="/test2" element={<Test2Screen />} />
                <Route path="/test3" element={<Test3Screen />} />
                <Route path="/add-user" element={<AddUserScreenMUI />} />

                {/* Routes which require a logged in user START OF SECTION */}
                <Route
                  element={
                    <ProtectedRoute
                      isAuthenticated={false}
                      redirectPath={"/login-user"}
                    />
                  }
                >
                  <Route path="/add-grave" element={<AddGraveScreenMUI />} />
                  <Route path="/users-table" element={<UsersTableScreen />} />
                  <Route
                    path="/users-table-crud"
                    element={<UsersTableScreenCrudWithProviders />}
                  />
                  <Route
                    path="/grave-types-table"
                    element={<GraveTypesTableScreen />}
                  />
                  <Route
                    path="/grave-types-crud"
                    element={<GraveTypesTableScreenCrud />}
                  />
                  <Route
                    path="/cemeteries-table-crud"
                    element={<CemeteriesTableScreenCrud />}
                  />

                  <Route
                    path="/grave-requests-crud"
                    element={<GraveRequestTableScreenCrud />}
                  />
                  <Route path="/add-deceased" element={<AddDeceasedScreen />} />
                  <Route path="/add-payer" element={<AddPayerScreen />} />
                </Route>
                {/* Routes which require a logged in user END OF SECTION*/}
              </Routes>
            </main>
          </LocalizationProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
}

export default App;
