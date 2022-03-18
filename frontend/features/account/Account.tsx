import { Logout } from "@mui/icons-material";
import {
  AppBar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import * as Routing from "../../app-routing-state";
import { useAppDispatch } from "../../app-store";
import { AppBarBackButton } from "../../ui";

const Account = () => {
  const dispatch = useAppDispatch();

  return (
    <>
      <AppBar>
        <Toolbar>
          <AppBarBackButton />
          <Typography variant="h6">Account</Typography>
        </Toolbar>
      </AppBar>

      <ListItemButton
        onClick={() => {
          // dispatch(
          //   Routing.Actions.push({
          //     type: "account",
          //     child: { type: "logout" },
          //   })
          // );
        }}
      >
        <ListItemIcon>
          <Logout />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </>
  );
};

export default Account;
