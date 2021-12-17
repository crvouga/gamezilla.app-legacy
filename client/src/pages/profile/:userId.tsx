import { AppBar, Avatar, Toolbar, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { BottomNavigation } from "../../components/BottomNavigation";

export const ProfilePage = () => {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Profile
          </Typography>
          <Link to="/account">
            <Avatar />
          </Link>
        </Toolbar>
      </AppBar>

      <BottomNavigation />
    </>
  );
};
