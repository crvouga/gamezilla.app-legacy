import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import * as Game from "./game-state";
import GameCreate from "./GameCreate";
import GameDisconnected from "./GameDisconnected";
import GameJoin from "./GameJoin";

const GameDisconnectedRoutes = ({
  dispatch,
}: {
  dispatch: (action: Game.IAction) => void;
}) => {
  return (
    <Routes>
      <Route path="/" element={<GameDisconnected />} />
      <Route path="/create" element={<GameCreate dispatch={dispatch} />} />
      <Route path="/join" element={<GameJoin dispatch={dispatch} />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default GameDisconnectedRoutes;
