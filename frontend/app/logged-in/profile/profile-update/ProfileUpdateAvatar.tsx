import React, { useState } from "react";
import { parseAvatarUrl } from "../profile-data";

const ProfileUpdateAvatar = ({
  profile,
}: {
  profile: {
    userId: string;
    avatarUrl?: string;
  };
}) => {
  return <Index profile={profile} />;
};

const Index = ({
  profile,
}: {
  profile: {
    userId: string;
    avatarUrl?: string;
  };
}) => {
  const parsed = parseAvatarUrl(profile.avatarUrl);

  const [avatarStyle, setAvatarStyle] = useState(parsed.avatarStyle);
  const [avatarSeed, setAvatarSeed] = useState(parsed.avatarSeed);

  const isUpdating = false;

  return (
    <>todo</>
    // <Box
    //   sx={{
    //     width: "100%",
    //     height: "100%",
    //     display: "flex",
    //     flexDirection: "column",
    //   }}
    // >
    //   <AppBar>
    //     <Toolbar>
    //       <Typography sx={{ flex: 1 }} variant="h6">
    //         Edit Avatar
    //       </Typography>
    //     </Toolbar>
    //   </AppBar>

    //   <Box sx={{ flex: 1 }}>
    //     <Box
    //       sx={{
    //         width: "100%",
    //         display: "grid",
    //         placeItems: "center",
    //         p: 2,
    //       }}
    //     >
    //       <Avatar
    //         sx={{ width: 160, height: 160 }}
    //         src={toAvatarUrl(avatarStyle, avatarSeed)}
    //       />
    //     </Box>

    //     <ListItemField
    //       to={"style"}
    //       label="Avatar Style"
    //       value={formatAvatarStyle(avatarStyle)}
    //     />

    //     <Box
    //       sx={{
    //         padding: 2,
    //         display: "flex",
    //         alignItems: "center",
    //       }}
    //     >
    //       <TextField
    //         sx={{ flex: 1 }}
    //         label="Avatar Seed"
    //         value={avatarSeed}
    //         onChange={(event) => {
    //           setAvatarSeed(toAvatarSeed(event.target.value));
    //         }}
    //       />
    //       <Button
    //         sx={{ p: 2 }}
    //         variant="outlined"
    //         onClick={() => {
    //           setAvatarSeed(generateRandomAvatarSeed());
    //         }}
    //       >
    //         Random
    //       </Button>
    //     </Box>
    //   </Box>

    //   <Box sx={{ p: 2, display: "flex" }}>
    //     <Button
    //       variant="outlined"
    //       sx={{ flex: 1, marginRight: 2 }}
    //       onClick={() => {}}
    //     >
    //       Cancel
    //     </Button>
    //     <LoadingButton
    //       sx={{ flex: 1 }}
    //       variant="contained"
    //       loading={isUpdating}
    //       size="large"
    //       onClick={() => {}}
    //     >
    //       Update
    //     </LoadingButton>
    //   </Box>
    // </Box>
  );
};

export default ProfileUpdateAvatar;
