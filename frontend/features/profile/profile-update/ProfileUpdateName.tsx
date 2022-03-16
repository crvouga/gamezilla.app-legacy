import { Clear } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app-store";
import * as Profile from "../profile-state";

const ProfileUpdateName = ({
  profile,
}: {
  profile: { userId: string; name?: string };
}) => {
  const [name, setName] = useState(profile.name);

  const navigate = useNavigate();

  const isUpdating = useAppSelector(
    (state) =>
      state.profile.type === "found" && state.profile.status === "updating"
  );

  const dispatch = useAppDispatch();

  const onDone = () => {
    dispatch(
      Profile.Actions.update({
        userId: profile.userId,
        name,
      })
    );
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Name
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 2, flex: 1 }}>
        <TextField
          label="Name"
          value={name}
          fullWidth
          sx={{ marginBottom: 2 }}
          onChange={(event) => {
            setName(event.target.value);
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => {
                    setName("");
                  }}
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Typography color="text.secondary">
          Help people discover your account by using the name you're known by:
          either your full name, nickname, or business name.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", p: 2 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{ flex: 1, marginRight: 2 }}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isUpdating}
          onClick={onDone}
          variant="contained"
          sx={{ flex: 1 }}
        >
          Update
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default ProfileUpdateName;
