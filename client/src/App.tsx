import React from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import { TicTacToe, ticTacToe } from "./tic-tac-toe";

export default function App() {
  const dispatch = useDispatch();
  const moves = useSelector(ticTacToe.selectors.moves);
  return (
    <>
      <TicTacToe
        rowCount={3}
        columnCount={3}
        moves={moves}
        onClick={(position) => {
          dispatch(ticTacToe.actions.clicked(position));
        }}
      />
    </>
  );
}
