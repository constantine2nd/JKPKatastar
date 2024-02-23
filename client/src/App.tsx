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
import AddUserScreenMUI from "./screens/AddUserScreenMUI";
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
import GraveTypesTableScreenCrud from "./screens/GraveTypesTableScreenCrud";
import TestScreen from "./screens/TestScreen";
import Test2Screen from "./screens/Test2Screen";
import Test3Screen from "./screens/Test3Screen";
import GraveRequestTableScreenCrud from "./screens/GraveRequestTableScreenCrud";
import GraveRequestStepperScreen from "./screens/GraveRequestStepperScreen";
import GravesTableScreenCrudWithProviders from "./screens/GravesTableScreenCrud";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginScreenMUI from "./screens/LoginScreenMUI";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import EmailVerificationScreen from "./screens/EmailVerificationScreen";
import ResetPasswordInitiation from "./screens/ResetPasswordInitiationScreen";
import ResetPassword from "./screens/ResetPasswordScreen";
import ExcelToJsonConverterScreen from "./screens/ConvertExcelScreen";
import DeceasedSearchScreen from "./screens/DeceasedSearchScreen";
import ExcelToJsonConverterOnlyGraves from "./screens/ConvertExcelScreenOnlyGraves";

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
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
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
                  <Route path="/add-grave" element={<AddGraveScreen />} />
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
