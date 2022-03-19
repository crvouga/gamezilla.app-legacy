import React from "react";

const ProfileDelete = ({ userId }: { userId: string }) => {
  const isDeleting = false;

  const onCancel = () => {};

  return (
    <>todo</>
    // <Drawer open anchor="bottom" onBackdropClick={onCancel}>
    //   <Typography sx={{ p: 2 }} align="center" variant="h5">
    //     Delete your profile forever?
    //   </Typography>

    //   <Box
    //     sx={{
    //       width: "100%",
    //       p: 2,
    //       display: "flex",
    //     }}
    //   >
    //     <Button
    //       variant="outlined"
    //       sx={{ flex: 1, marginRight: 2 }}
    //       onClick={onCancel}
    //     >
    //       Cancel
    //     </Button>

    //     <LoadingButton
    //       sx={{ flex: 1 }}
    //       variant="contained"
    //       loading={isDeleting}
    //       size="large"
    //       onClick={() => {
    //         // dispatch(Profile.actions.delete({ userId }));
    //       }}
    //     >
    //       Delete
    //     </LoadingButton>
    //   </Box>
    // </Drawer>
  );
};

export default ProfileDelete;
