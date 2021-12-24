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

export const SignInPage = () => {
  const [state, setState] = useState<"signing-in" | "idle">("idle");

  const handleSignIn = () => () => {
    setState("signing-in");
    console.log("LOG IN");
  };

  return (
    <>
      <LoadingDialog title="Signing In" open={state === "signing-in"} />

      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Gamezilla</Typography>
        </Toolbar>
      </AppBar>

      <Container disableGutters>
        <List>
          <ListItem divider button onClick={handleSignIn()}>
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
