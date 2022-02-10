import {
  ChevronLeft,
  DarkMode,
  LightMode,
  SettingsBrightness,
} from "@mui/icons-material";
import {
  AppBar,
  Backdrop,
  Box,
  CircularProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { updateThemeMode } from "./theme-data-access";
import { IThemeMode, decodeThemeMode } from "./theme-data";

const ThemeUpdate = ({
  themeMode,
  profile,
}: {
  themeMode: IThemeMode;
  profile: { userId: string };
}) => {
  const navigate = useNavigate();

  const mutation = useMutation(updateThemeMode);

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
          <Typography variant="h6">Theme</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Typography gutterBottom color="text.secondary">
          Mode
        </Typography>

        <ToggleButtonGroup
          fullWidth
          color="primary"
          exclusive
          value={themeMode}
          onChange={(_event, value) => {
            mutation.mutate({
              userId: profile.userId,
              themeMode: decodeThemeMode(value),
            });
          }}
          size="small"
        >
          <ToggleButton value="LIGHT">
            <LightMode sx={{ marginRight: 1 }} />
            Light
          </ToggleButton>
          <ToggleButton value="SYSTEM">
            <SettingsBrightness sx={{ marginRight: 1 }} />
            System
          </ToggleButton>
          <ToggleButton value="DARK">
            <DarkMode sx={{ marginRight: 1 }} />
            Dark
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Backdrop open={mutation.status === "loading"}>
        <CircularProgress />
      </Backdrop>
    </>
  );
};

export default ThemeUpdate;
