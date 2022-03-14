import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { IGameRoom } from "./game-data-access";
import GameConnected from "./GameConnected";
import GameLeave from "./GameLeave";

const GameConnectedRoutes = ({ onLeave }: { onLeave: () => void }) => {
  return (
    <Routes>
      <Route path="/" element={<GameConnected />} />
      <Route path="/leave" element={<GameLeave onLeave={onLeave} />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default GameConnectedRoutes;
