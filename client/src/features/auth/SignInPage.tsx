import { ChevronRight, Google } from "@mui/icons-material";
import {
  AppBar,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { LoadingDialog } from "src/components/LoadingDialog";
import { authDataAccess } from "src/features";

export const SignInPage = () => {
  const [state, setState] = useState<"idle" | "redirecting">("idle");

  const onSignIn = async (
    ...params: Parameters<typeof authDataAccess.signInWithRedirect>
  ) => {
    setState("redirecting");
    await authDataAccess.signInWithRedirect(...params);
  };

  return (
    <>
      <LoadingDialog title="Redirecting" open={state === "redirecting"} />

      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Gamezilla</Typography>
        </Toolbar>
      </AppBar>

      <Container disableGutters>
        <List>
          <ListItem divider button onClick={() => onSignIn({ type: "google" })}>
            <ListItemIcon>
              <Google />
            </ListItemIcon>
            <ListItemText primary="Continue With Google" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Container>
    </>
  );
};
