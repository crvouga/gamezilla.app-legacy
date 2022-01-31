import {
  AppBar,
  Box,
  Button,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { ModalLoader } from "../components/ModalLoader";
import { updateProfile } from "../data-access";

export const EditProfileUsernamePage = ({
  profile,
}: {
  profile: { userId: string; username?: string };
}) => {
  const [username, setUsername] = useState(profile.username);

  const navigate = useNavigate();

  const mutation = useMutation(updateProfile, {
    onSuccess: () => {
      navigate(-1);
    },
  });

  const onDone = () => {
    mutation.mutate({
      userId: profile.userId,
      username,
    });
  };

  return (
    <>
      <ModalLoader open={mutation.status === "loading"} title="Updating..." />

      <AppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Edit Username
          </Typography>
          <Button onClick={onDone}>Done</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 2 }}>
        <TextField
          label="Username"
          defaultValue={username}
          fullWidth
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />
      </Box>
    </>
  );
};
