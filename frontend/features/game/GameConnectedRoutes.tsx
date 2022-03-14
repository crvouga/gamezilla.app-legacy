import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import GameConnected from "./GameConnected";
import GameLeave from "./GameLeave";

const GameConnectedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<GameConnected />} />
      <Route path="/leave" element={<GameLeave />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default GameConnectedRoutes;
