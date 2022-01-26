import {
  AppBar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useMutation } from "react-query";
import { Icons, ModalLoader } from "../components";
import { login } from "../data-access";

export const LoginPage = () => {
  const mutation = useMutation(login);

  return (
    <>
      <ModalLoader
        open={mutation.status === "loading"}
        title="Redirecting..."
      />

      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6" align="center">
            Login
          </Typography>
        </Toolbar>
      </AppBar>

      <List>
        <ListItemButton
          divider
          onClick={() => {
            mutation.mutate({ provider: "google" });
          }}
        >
          <ListItemIcon>
            <Icons.Google />
          </ListItemIcon>
          <ListItemText primary="Continue With Google" />
          <ListItemSecondaryAction>
            <Icons.ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};
