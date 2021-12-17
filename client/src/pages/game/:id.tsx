import { ArrowBack } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Toolbar,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { TicTacToeBoard } from "../../components/TicTacToeBoard";
import { ticTacToe } from "../../game/tic-tac-toe";

export const GameIdPage = () => {
  const dispatch = useDispatch();
  const moves = useSelector(ticTacToe.selectors.moves);
  // const params = useParams<"id">();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Link to="/">
            <IconButton edge="start">
              <ArrowBack />
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>

      <Container disableGutters>
        <List>
          <TicTacToeBoard
            rowCount={3}
            columnCount={3}
            moves={moves}
            onClick={(position) => {
              dispatch(ticTacToe.actions.clicked(position));
            }}
          />
          <ListItem>
            <ListItemAvatar>
              <Avatar />
            </ListItemAvatar>
            <ListItemText primary="Player" secondary="X" />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar />
            </ListItemAvatar>
            <ListItemText primary="Other Player" secondary="O" />
          </ListItem>
        </List>

        <List>
          <ListSubheader>Log</ListSubheader>
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
