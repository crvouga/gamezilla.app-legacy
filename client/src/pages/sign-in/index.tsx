import React from "react";
import {
  Typography,
  AppBar,
  Container,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { Google } from "@mui/icons-material";
import { auth } from "../../auth/auth";
import { useDispatch } from "react-redux";

export const SignInPage = () => {
  const dispatch = useDispatch();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Sign In</Typography>
        </Toolbar>
      </AppBar>
      <Container disableGutters>
        <List>
          <ListItem
            divider
            button
            onClick={() => dispatch(auth.actions.signIn({ type: "google" }))}
          >
            <ListItemIcon>
              <Google />
            </ListItemIcon>
            <ListItemText primary="Sign In With Google" />
          </ListItem>
        </List>
      </Container>
    </>
  );
};
