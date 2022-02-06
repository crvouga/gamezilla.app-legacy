import { ChevronRight } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "../components/Link";

export const HomePage = ({ profile }: { profile: { avatarUrl?: string } }) => {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>

          <Link href="/account">
            <Avatar src={profile.avatarUrl} />
          </Link>
        </Toolbar>
      </AppBar>

      <List>
        <Link href="/tic-tac-toe">
          <ListItemButton>
            <ListItemText primary=" Tic Tac Toe" />
            <ListItemIcon>
              <ChevronRight />
            </ListItemIcon>
          </ListItemButton>
        </Link>
      </List>
    </>
  );
};
