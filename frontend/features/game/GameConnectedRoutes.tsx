import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import GameConnected from "./GameConnected";
import GameLeave from "./GameLeave";
import * as Game from "./game-state";

const GameConnectedRoutes = ({
  dispatch,
}: {
  dispatch: (action: Game.IAction) => void;
}) => {
  return (
    <Routes>
      <Route path="/" element={<GameConnected />} />
      <Route path="/leave" element={<GameLeave dispatch={dispatch} />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default GameConnectedRoutes;
