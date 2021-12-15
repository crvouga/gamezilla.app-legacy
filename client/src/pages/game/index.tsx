import {
  AppBar,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { Home } from "@mui/icons-material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TicTacToe, ticTacToe } from "../../tic-tac-toe";
import { Link } from "react-router-dom";
import { game } from "../../game/game";

export const GamePage = () => {
  const dispatch = useDispatch();
  const moves = useSelector(ticTacToe.selectors.moves);

  useEffect(() => {
    dispatch(game.actions.sync());
  }, [dispatch]);

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
    </>
  );
};
