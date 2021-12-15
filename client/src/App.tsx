import React from "react";
import "./App.css";
import TicTacToeBoard from "./tic-tac-toe/TicTacToeBoard";

export default function App() {
  return (
    <>
      <TicTacToeBoard
        rowCount={3}
        columnCount={3}
        onClick={(position) => {
          console.log({ position });
        }}
      />
    </>
  );
}
