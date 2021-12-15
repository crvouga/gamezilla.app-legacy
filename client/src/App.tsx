import React from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages";
import { GamePage } from "./pages/game";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </>
  );
}
