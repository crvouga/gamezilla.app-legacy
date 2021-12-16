import { ChevronRight, Gamepad, ExitToApp } from "@mui/icons-material";
import {
  Button,
  AppBar,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { auth } from "../auth/auth";
import { useDispatch } from "react-redux";

export const HomePage = () => {
  const [state, setState] = useState<"confirm-sign-out" | "idle">("idle");
  const dispatch = useDispatch();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Home</Typography>
        </Toolbar>
      </AppBar>

      <Container disableGutters>
        <List>
          <Link to="/game/create">
            <ListItem button divider>
              <ListItemIcon>
                <Gamepad />
              </ListItemIcon>
              <ListItemText primary="Create Game" />
              <ListItemSecondaryAction>
                <ChevronRight />
              </ListItemSecondaryAction>
            </ListItem>
          </Link>
          <ListItem button divider onClick={() => setState("confirm-sign-out")}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
          <Dialog
            open={state === "confirm-sign-out"}
            onClose={() => setState("idle")}
          >
            <DialogTitle>Sign Out of Gamezilla?</DialogTitle>
            <DialogActions>
              <Button onClick={() => setState("idle")}>Cancel</Button>
              <Button onClick={() => dispatch(auth.actions.signOut())}>
                Sign Out
              </Button>
            </DialogActions>
          </Dialog>
        </List>
      </Container>
    </>
  );
};
