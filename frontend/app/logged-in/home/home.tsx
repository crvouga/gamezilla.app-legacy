import { ChevronRight, Games, Logout, Person } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";

export const view = ({ profile }: { profile: { avatarUrl?: string } }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>

          <Avatar
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
            src={profile.avatarUrl}
          />
        </Toolbar>
      </AppBar>

      <List>
        <ListItemButton
          onClick={() => {
            // dispatch(
            //   Routing.actions.push({
            //     type: "account",
            //     child: {
            //       type: "login",
            //     },
            //   })
            // );
          }}
        >
          <ListItemIcon>
            <Games />
          </ListItemIcon>
          <ListItemText primary="Play Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};
