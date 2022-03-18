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
import { AppBarBackButton } from "../../ui";

const Account = () => {
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
          //   Routing.actions.push({
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
