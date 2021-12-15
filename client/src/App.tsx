import { Container, List, ListItem, ListItemText } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { TicTacToe, ticTacToe } from "./tic-tac-toe";

export default function App() {
  const dispatch = useDispatch();
  const moves = useSelector(ticTacToe.selectors.moves);

  return (
    <Container disableGutters>
      <TicTacToe
        rowCount={3}
        columnCount={3}
        moves={moves}
        onClick={(position) => {
          dispatch(ticTacToe.actions.clicked(position));
        }}
      />

      <List>
        {moves.map((move) => (
          <ListItem key={JSON.stringify(move)}>
            <ListItemText
              primary={`Player ${move.player} moved at position ${move.row}, ${move.column}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
