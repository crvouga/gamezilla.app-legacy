// import { Box, CircularProgress, Dialog, Typography } from "@mui/material";
import React from "react";
import { IProfile } from "../profile-data-access";

const ProfileUpdate = ({ profile }: { profile: IProfile }) => {
  const isUpdating = false;

  return (
    <>
      todo
      {/* <Dialog open={isUpdating}>
        <Box
          sx={{
            padding: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ marginRight: 2 }} />
          <Typography>Updating...</Typography>
        </Box>
      </Dialog> */}
    </>
  );
};

export default ProfileUpdate;
