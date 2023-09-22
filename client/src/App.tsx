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

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/add-grave" element={<AddGraveScreen />} />
          <Route path="/single-grave" element={<SingleGraveScreen />} />
          <Route path="/add-deceased" element={<AddDeceasedScreen />} />
          <Route path="/add-payer" element={<AddPayerScreen />} />
          <Route path="/graves-table" element={<GravesTableScreen />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
