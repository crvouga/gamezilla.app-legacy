import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import GameCreate from "./GameCreate";
import GameIndex from "./GameIndex";
import GameJoin from "./GameJoin";

const Game = ({
  onCreate,
  onJoin,
}: {
  onCreate: () => void;
  onJoin: () => void;
}) => {
  return (
    <Routes>
      <Route path="/" element={<GameIndex />} />
      <Route path="/create" element={<GameCreate onCreate={onCreate} />} />
      <Route path="/join" element={<GameJoin onJoin={onJoin} />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default Game;
