import React, { useState } from "react";
import {
  Typography,
  AppBar,
  Container,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from "@mui/material";
import { Google, ChevronRight } from "@mui/icons-material";
import { auth } from "../../auth/auth";
import { useDispatch } from "react-redux";
import { ISignInMethod } from "../../auth/sign-in";
import { LoadingDialog } from "../../components/LoadingDialog";

export const SignInPage = () => {
  const dispatch = useDispatch();

  const [state, setState] = useState<"signing-in" | "idle">("idle");

  const handleSignIn = (method: ISignInMethod) => () => {
    setState("signing-in");
    dispatch(auth.actions.signIn(method));
  };

  return (
    <>
      <LoadingDialog title="Signing In" open={state === "signing-in"} />

      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Sign In</Typography>
        </Toolbar>
      </AppBar>
      <Container disableGutters>
        <List>
          <ListItem divider button onClick={handleSignIn({ type: "google" })}>
            <ListItemIcon>
              <Google />
            </ListItemIcon>
            <ListItemText primary="Sign In With Google" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Container>
    </>
  );
};
