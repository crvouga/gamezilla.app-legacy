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
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ticTacToe, TicTacToeBoard } from "src/features";

export const GamePage = () => {
  const dispatch = useDispatch();

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
            moves={[]}
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
          {
            /* {[].map((move) => (
            <ListItem key={JSON.stringify(move)}>
              <ListItemText
                primary={`Player ${move.player} moved at position ${move.row}, ${move.column}`}
              />
            </ListItem>
          ))} */
          }
        </List>
      </Container>
    </>
  );
};
