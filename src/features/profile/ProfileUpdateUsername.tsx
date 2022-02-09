import { ChevronLeft, Clear } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  AppBar,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useRef } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "./profile-data-access";

const ProfileUpdateUsername = ({
  profile,
}: {
  profile: { userId: string; username?: string };
}) => {
  const usernameRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  const mutation = useMutation(updateProfile, {
    onSuccess: () => {
      navigate(-1);
    },
  });

  const onDone = () => {
    if (usernameRef.current) {
      const username = usernameRef.current.value;

      mutation.mutate({
        userId: profile.userId,
        username,
      });
    }
  };

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
          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Username
          </Typography>
          <LoadingButton
            loading={mutation.status === "loading"}
            onClick={onDone}
          >
            Done
          </LoadingButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 2 }}>
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
    </>
  );
};

export default ProfileUpdateUsername;
