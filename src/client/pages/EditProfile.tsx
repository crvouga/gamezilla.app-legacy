import {
  AppBar,
  Avatar,
  Button,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link } from "../components/Link";

export const EditProfilePage = ({
  profile,
}: {
  profile: { avatarUrl?: string; displayName?: string };
}) => {
  const [displayName, setDisplayName] = useState(profile?.displayName);

  return (
    <>
      <AppBar>
        <Toolbar>
          <Button>Cancel</Button>
          <Typography variant="h6">Edit Profile</Typography>
          <Button>Done</Button>
        </Toolbar>
      </AppBar>

      <Avatar src={profile.avatarUrl} />

      <Link href="/profile/avatar/edit">
        <Button sx={{ margin: "auto", marginTop: 2 }}>Edit Avatar</Button>
      </Link>

      <div className="p-4">
        <TextField
          id="displayName"
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
          }}
          label="Display Name"
        />
      </div>
    </>
  );
};
