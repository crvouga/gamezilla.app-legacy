import { Close, Done } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import React from "react";

export const ProfileEditPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <Close />
          </IconButton>

          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Profile
          </Typography>

          <IconButton edge="end" onClick={() => navigate(-1)}>
            <Done />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ paddingX: 2 }}>
        <Avatar
          sx={{
            marginX: "auto",
            width: "120px",
            height: "120px",
            marginTop: 2,
            marginBottom: 1 / 2,
          }}
        />

        <Link to="/avatar/edit">
          <Button
            sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          >
            Change Avatar
          </Button>
        </Link>

        <TextField
          label="Username"
          fullWidth
          sx={{ marginBottom: 2 }}
        />

        <TextField
          label="Name"
          fullWidth
          sx={{ marginBottom: 2 }}
          helperText="Help people find you by providing the name you go by"
        />
      </Box>
    </>
  );
};
