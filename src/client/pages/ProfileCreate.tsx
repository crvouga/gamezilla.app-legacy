import { Close } from "@mui/icons-material";
import {
  AppBar,
  Box,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import React from "react";
import { useMutation } from "react-query";
import { Link } from "../components/Link";
import { ModalLoader } from "../components/ModalLoader";
import { createProfile } from "../data-access";
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

  return (
    <>
      <ModalLoader open={mutation.status === "loading"} title="Creating..." />

      <AppBar>
        <Toolbar>
          <Link href="/logout">
            <IconButton edge="start">
              <Close />
            </IconButton>
          </Link>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Create Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, p: 2 }}>
        <form
          onSubmit={(event) => {
            event.preventDefault();

            const formData = new FormData(event.currentTarget);

            const name = formData.get("name")?.toString();
            const username = formData.get("username")?.toString();

            if (name && username) {
              mutation.mutate({
                userId,
                name,
                username,
                avatarUrl: toAvatarUrl(
                  "croodles-neutral",
                  generateRandomAvatarSeed()
                ),
              });
            }
          }}
        >
          <TextField
            sx={{ marginBottom: 4 }}
            defaultValue={userMetadata.name}
            label="Name"
            name="name"
          />
          <TextField
            sx={{ marginBottom: 4 }}
            defaultValue={userMetadata.name?.replace(" ", "").toLowerCase()}
            label="Username"
            name="username"
          />

          <Button fullWidth variant="contained" size="large" type="submit">
            Create Profile
          </Button>
        </form>
      </Box>
    </>
  );
};

export default ProfileCreate;
