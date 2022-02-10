import {
  ChevronLeft,
  DarkMode,
  LightMode,
  SettingsBrightness,
} from "@mui/icons-material";
import {
  Box,
  AppBar,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const AccountSettings = ({
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
          <Typography variant="h6">Settings</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Typography gutterBottom color="text.secondary">
          Theme
        </Typography>
        <ToggleButtonGroup
          fullWidth
          color="primary"
          exclusive
          value="system"
          // onChange={handleChange}
        >
          <ToggleButton value="light">
            <LightMode sx={{ marginRight: 1 }} />
            Light
          </ToggleButton>
          <ToggleButton value="system">
            <SettingsBrightness sx={{ marginRight: 1 }} />
            System
          </ToggleButton>
          <ToggleButton value="dark">
            <DarkMode sx={{ marginRight: 1 }} />
            Dark
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </>
  );
};

export default AccountSettings;
