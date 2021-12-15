import React from "react";
import { useState } from "react";
import "./App.css";
import TicTacToeBoard, { BoardMove } from "./tic-tac-toe/TicTacToeBoard";

export default function App() {
  const [moves, setMoves] = useState<BoardMove[]>([]);
  return (
    <>
      <TicTacToeBoard
        rowCount={3}
        columnCount={3}
        moves={moves}
        onClick={(position) => {
          setMoves((moves) => {
            return [
              ...moves,
              {
                player: moves.length % 2 === 0 ? "o" : "x",
                ...position,
              },
            ];
          });
        }}
      />
    </>
  );
}
