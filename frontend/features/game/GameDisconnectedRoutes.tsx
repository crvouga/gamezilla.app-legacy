import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import GameCreate from "./GameCreate";
import GameDisconnected from "./GameDisconnected";
import GameJoin from "./GameJoin";

const GameDisconnectedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<GameDisconnected />} />
      <Route path="/create" element={<GameCreate />} />
      <Route path="/join" element={<GameJoin />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default GameDisconnectedRoutes;
