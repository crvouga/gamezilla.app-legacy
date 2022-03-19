import React, { useRef } from "react";

const ProfileUpdateUsername = ({
  profile,
}: {
  profile: { userId: string; username?: string };
}) => {
  const usernameRef = useRef<HTMLInputElement | null>(null);

  const onCancel = () => {
    if (usernameRef.current) {
      usernameRef.current.value = profile.username ?? "";
    }
  };
  const isUpdating = false;
  const onDone = () => {
    if (usernameRef.current) {
      const username = usernameRef.current.value;
    }
  };

  return (
    <>todo</>
    // <Box
    //   sx={{
    //     height: "100%",
    //     width: "100%",
    //     overflow: "hidden",
    //     display: "flex",
    //     flexDirection: "column",
    //   }}
    // >
    //   <AppBar>
    //     <Toolbar>
    //       <Typography variant="h6" sx={{ flex: 1 }}>
    //         Edit Username
    //       </Typography>
    //     </Toolbar>
    //   </AppBar>

    //   <Box sx={{ padding: 2, flex: 1 }}>
    //     <TextField
    //       label="Username"
    //       defaultValue={profile.username}
    //       fullWidth
    //       inputRef={usernameRef}
    //       InputProps={{
    //         endAdornment: (
    //           <InputAdornment position="end">
    //             <IconButton
    //               edge="end"
    //               onClick={() => {
    //                 if (usernameRef.current) {
    //                   usernameRef.current.value = "";
    //                   usernameRef.current.focus();
    //                 }
    //               }}
    //             >
    //               <Clear />
    //             </IconButton>
    //           </InputAdornment>
    //         ),
    //       }}
    //     />
    //   </Box>

    //   <Box sx={{ p: 2, display: "flex" }}>
    //     <Button
    //       variant="outlined"
    //       sx={{ flex: 1, marginRight: 2 }}
    //       onClick={onCancel}
    //     >
    //       Cancel
    //     </Button>

    //     <LoadingButton
    //       sx={{ flex: 1 }}
    //       loading={isUpdating}
    //       variant="contained"
    //       onClick={onDone}
    //     >
    //       Update
    //     </LoadingButton>
    //   </Box>
    // </Box>
  );
};

export default ProfileUpdateUsername;
