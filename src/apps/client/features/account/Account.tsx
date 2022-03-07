import {
  ChevronLeft,
  ChevronRight,
  DeleteForever,
  Edit,
  Logout,
} from "@mui/icons-material";
import {
  AppBar,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Account = ({
  profile,
}: {
  profile: { username?: string; avatarUrl?: string };
}) => {
  const navigate = useNavigate();
  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6">Account</Typography>
        </Toolbar>
      </AppBar>

      <List>
        <Link to="/profile/edit">
          <ListItemButton>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary="Edit Profile" />
            <ListItemSecondaryAction>
              <ChevronRight />
            </ListItemSecondaryAction>
          </ListItemButton>
        </Link>

        <Link to="/profile/delete">
          <ListItemButton divider>
            <ListItemIcon>
              <DeleteForever />
            </ListItemIcon>
            <ListItemText primary="Delete Profile" />
          </ListItemButton>
        </Link>

        <Link to="/logout">
          <ListItemButton>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Link>
      </List>
    </>
  );
};

export default Account;
