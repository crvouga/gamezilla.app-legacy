import { Alert, Snackbar } from "@mui/material";
import { Room } from "colyseus.js";
import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { create } from "./game-room-data-access";
import GameCreate from "./GameCreate";
import GameRoom from "./GameRoom";

type IState =
  | {
      type: "idle";
    }
  | {
      type: "error";
      error: Error;
    }
  | {
      type: "loading";
    }
  | {
      type: "success";
      room: Room<unknown>;
    };

const Game = () => {
  const [state, setState] = useState<IState>({ type: "idle" });
  const [error, setError] = useState<Error | null>(null);

  const onCreate = async () => {
    setState({ type: "loading" });

    const result = await create();

    if (result.type === "error") {
      setState({ type: "error", error: result.error });
      setError(result.error);
      return;
    }

    setState({ type: "success", room: result.data });
  };

  if (state.type === "success") {
    return (
      <Routes>
        <Route path="/" element={<GameRoom room={state.room} />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={state.type === "error"}
        onClose={() => setState({ type: "idle" })}
        autoHideDuration={3000}
      >
        <Alert severity="error">{error?.message}</Alert>
      </Snackbar>

      <Routes>
        <Route path="/create" element={<GameCreate onCreate={onCreate} />} />
        <Route path="*" element={<Navigate to="create" replace />} />
      </Routes>
    </>
  );
};

export default Game;
