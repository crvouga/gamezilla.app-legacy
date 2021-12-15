import React from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages";
import { GameCreatePage } from "./pages/game/create";
import { GameIdPage } from "./pages/game/[id]";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/create" element={<GameCreatePage />} />
        <Route path="/game/:id" element={<GameIdPage />} />
      </Routes>
    </>
  );
}
