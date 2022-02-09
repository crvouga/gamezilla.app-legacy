import { Add, ChevronRight, Search } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
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

const Home = ({ profile }: { profile: { avatarUrl?: string } }) => {
  const navigate = useNavigate();

  const onCreateGame = () => {
    navigate(`/game-session/${Math.floor(Math.random() * 100000)}`);
  };

  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>

          <Link to="/account">
            <Avatar src={profile.avatarUrl} />
          </Link>
        </Toolbar>
      </AppBar>

      <List>
        <ListItemButton onClick={onCreateGame}>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="Create Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <Search />
          </ListItemIcon>
          <ListItemText primary="Join Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>
    </>
  );
};

export default Home;
