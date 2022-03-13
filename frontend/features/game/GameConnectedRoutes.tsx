import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { IGameRoom } from "./game-room-data-access";
import GameConnected from "./GameConnected";
import GameLeave from "./GameLeave";

const GameConnectedRoutes = ({
  room,
  onLeave,
}: {
  room: IGameRoom;
  onLeave: () => void;
}) => {
  return (
    <Routes>
      <Route path="/" element={<GameConnected room={room} />} />
      <Route path="/leave" element={<GameLeave onLeave={onLeave} />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default GameConnectedRoutes;
