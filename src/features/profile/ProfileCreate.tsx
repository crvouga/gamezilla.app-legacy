import { LoadingButton } from "@mui/lab";
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
import { createProfile } from "./profile-data-access";
import { generateRandomAvatarSeed, toAvatarUrl } from "./ProfileUpdateAvatar";

const ProfileCreate = ({
  userId,
  userMetadata,
}: {
  userId: string;
  userMetadata: {
    name?: string;
  };
}) => {
  const mutation = useMutation(createProfile);
  const [name, setName] = useState(userMetadata.name ?? "");
  const [username, setUsername] = useState(
    userMetadata.name?.replace(" ", "").toLowerCase() ?? ""
  );

  const onCreate = () => {
    mutation.mutate({
      userId,
      name,
      username,
      avatarUrl: toAvatarUrl("croodles-neutral", generateRandomAvatarSeed()),
    });
  };

  const navigate = useNavigate();

  const onCancel = () => {
    navigate("/logout");
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
            Create Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, p: 2 }}>
        <TextField
          sx={{ marginBottom: 2 }}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          label="Name"
        />

        <TextField
          value={username}
          onChange={(event) => setUsername(event.currentTarget.value)}
          label="Username"
        />
      </Box>
      <Box sx={{ display: "flex", p: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ flex: 1, marginRight: 2 }}
        >
          Cancel
        </Button>
        <LoadingButton
          sx={{ flex: 1 }}
          onClick={onCreate}
          fullWidth
          variant="contained"
          size="large"
          type="submit"
          loading={mutation.status === "loading"}
        >
          Create
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default ProfileCreate;
