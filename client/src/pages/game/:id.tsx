import { Home } from "@mui/icons-material";
import {
  AppBar,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { TicTacToeBoard } from "../../components/TicTacToeBoard";
import { ticTacToe } from "../../game/tic-tac-toe";

export const GameIdPage = () => {
  const dispatch = useDispatch();
  const moves = useSelector(ticTacToe.selectors.moves);
  const params = useParams<"id">();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Link to="/">
            <IconButton edge="start">
              <Home />
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>

      <Container disableGutters>
        {JSON.stringify(params)}
        <TicTacToeBoard
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
    </>
  );
};
