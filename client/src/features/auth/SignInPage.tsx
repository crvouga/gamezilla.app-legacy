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
import React from "react";
import { useMutation } from "react-query";
import { LoadingDialog } from "src/components/LoadingDialog";
import { authDataAccess } from "src/features";

export const SignInPage = () => {
  const mutation = useMutation(authDataAccess.signIn);

  return (
    <>
      <LoadingDialog title="Logging In" open={mutation.status === "loading"} />

      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Gamezilla</Typography>
        </Toolbar>
      </AppBar>

      <Container disableGutters>
        <List>
          <ListItem
            divider
            button
            onClick={() => mutation.mutate({ type: "google" })}
          >
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
