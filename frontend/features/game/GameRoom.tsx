import { Alert, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { create } from "./game-room-data-access";
import GameRoomCreate from "./GameRoomCreate";
import GameRoomSession from "./GameRoomSession";

const GameRoom = () => {
  const [result, setResult] = useState<
    { type: "idle" } | Awaited<ReturnType<typeof create>>
  >({ type: "idle" });

  const onCreate = async () => {
    const result = await create();
    setResult(result);

    if (result.type === "success") {
      const room = result.data;
      room.onError((code, message) => {
        console.log("room.error", {
          sessionId: room.sessionId,
          code,
          message,
        });
      });

      room.onMessage("*", (type, message) => {
        console.log("room.message", {
          sessionId: room.sessionId,
          type,
          message,
        });
      });

      room.onLeave((code) => {
        console.log("room.leave", { sessionId: room.sessionId, code });
      });
    }
  };

  if (result.type === "success") {
    const room = result.data;

    return (
      <Routes>
        <Route path="/session" element={<GameRoomSession room={room} />} />
        <Route path="*" element={<Navigate to="session" replace />} />
      </Routes>
    );
  }

  const error =
    result.type === "error" && result.errors.length > 0
      ? result.errors[0]
      : { message: "Something went wrong an unknown reason" };

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={result.type === "error"}
        onClose={() => setResult({ type: "idle" })}
        autoHideDuration={3000}
      >
        <Alert key={error.message} severity="error">
          {error.message}
        </Alert>
      </Snackbar>

      <Routes>
        <Route
          path="/create"
          element={<GameRoomCreate onCreate={onCreate} />}
        />
        <Route path="*" element={<Navigate to="create" replace />} />
      </Routes>
    </>
  );
};

export default GameRoom;
