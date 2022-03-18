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
import React, { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../app-store";
import * as Profile from "../profile-state";

const ProfileUpdateUsername = ({
  profile,
}: {
  profile: { userId: string; username?: string };
}) => {
  const usernameRef = useRef<HTMLInputElement | null>(null);

  const isUpdating = useAppSelector(
    (state) =>
      state.profile.type === "found" && state.profile.status === "updating"
  );

  const dispatch = useAppDispatch();

  const onCancel = () => {
    if (usernameRef.current) {
      usernameRef.current.value = profile.username ?? "";
    }
  };

  const onDone = () => {
    if (usernameRef.current) {
      const username = usernameRef.current.value;

      dispatch(
        Profile.Actions.update({
          userId: profile.userId,
          username,
        })
      );
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Username
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 2, flex: 1 }}>
        <TextField
          label="Username"
          defaultValue={profile.username}
          fullWidth
          inputRef={usernameRef}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => {
                    if (usernameRef.current) {
                      usernameRef.current.value = "";
                      usernameRef.current.focus();
                    }
                  }}
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ p: 2, display: "flex" }}>
        <Button
          variant="outlined"
          sx={{ flex: 1, marginRight: 2 }}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <LoadingButton
          sx={{ flex: 1 }}
          loading={isUpdating}
          variant="contained"
          onClick={onDone}
        >
          Update
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default ProfileUpdateUsername;
