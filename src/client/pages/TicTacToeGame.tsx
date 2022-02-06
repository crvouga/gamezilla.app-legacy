import { AppBar, Toolbar } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";

export const TicTacToeGamePage = () => {
  const { gameId } = useParams();

  if (gameId) {
    return <TicTacToeGame gameId={gameId} />;
  }

  return <></>;
};

const theme = {
  background: "#31BCAC",
  line: "#28A093",
  x: "#28A093",
  o: "#F2EAD2",
};

const TicTacToeGame = ({ gameId }: { gameId: string }) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <BackButton />
        </Toolbar>
      </AppBar>

      <svg width="100%" viewBox="0 0 3 3">
        <rect x={0} y={0} width="100%" height="100%" fill={theme.background} />

        <g stroke={theme.line} strokeWidth={0.1}>
          <line x1={0} y1={1} x2={3} y2={1} />
          <line x1={0} y1={2} x2={3} y2={2} />
          <line x1={1} y1={0} x2={1} y2={3} />
          <line x1={2} y1={0} x2={2} y2={3} />
        </g>
      </svg>
      {gameId}
    </>
  );
};
