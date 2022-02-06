import { ChevronRight, Google } from "@mui/icons-material";
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
import { ModalLoader } from "../components/modal-loader";
import { login } from "../data-access";

const Login = () => {
  const mutation = useMutation(login);

  return (
    <>
      <ModalLoader
        open={mutation.status === "loading"}
        title="Redirecting..."
      />

      <AppBar>
        <Toolbar>
          <Typography align="center" sx={{ flex: 1 }} variant="h6">
            Login
          </Typography>
        </Toolbar>
      </AppBar>

      <List>
        <ListItemButton
          onClick={() => {
            mutation.mutate({ provider: "google" });
          }}
        >
          <ListItemIcon>
            <Google />
          </ListItemIcon>
          <ListItemText primary="Continue With Google" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};

export default Login;
