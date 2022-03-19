import React, { useState } from "react";

const ProfileCreate = ({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) => {
  const isCreating = false;

  const [name, setName] = useState(defaultName);
  const [username, setUsername] = useState(
    name.replace(" ", "").toLowerCase() ?? ""
  );

  const onCreate = () => {
    // dispatch(
    //   Profile.actions.create({
    //     userId,
    //     name,
    //     username,
    //     avatarUrl: toAvatarUrl("croodles-neutral", generateRandomAvatarSeed()),
    //   })
    // );
  };

  const onCancel = () => {};

  const back = () => {};

  switch ("1") {
    case "1":
      return (
        <>todo</>
        // <Layout
        //   title="Create Profile"
        //   backButtonProps={{
        //     children: "Cancel",
        //     onClick: onCancel,
        //   }}
        //   nextButtonProps={{
        //     children: "Next",
        //     onClick: () => {},
        //   }}
        // >
        //   <TextField
        //     sx={{ marginBottom: 2 }}
        //     value={name}
        //     onChange={(event) => {
        //       setName(event.currentTarget.value);
        //     }}
        //     label="Name"
        //   />
        // </Layout>
      );

    default:
      return (
        <>todo</>
        // <Layout
        //   title="Create Profile"
        //   backButtonProps={{
        //     children: "Back",
        //     onClick: back,
        //   }}
        //   nextButtonProps={{
        //     children: "Done",
        //     loading: isCreating,
        //     onClick: onCreate,
        //   }}
        // >
        //   <TextField
        //     sx={{ marginBottom: 2 }}
        //     value={username}
        //     onChange={(event) => {
        //       setUsername(event.currentTarget.value);
        //     }}
        //     label="Username"
        //   />
        // </Layout>
      );
  }
};

const Layout = ({ title }: { title: string }) => {
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
    //       <Typography variant="h6" sx={{ flex: 1 }}>
    //         {title}
    //       </Typography>
    //     </Toolbar>
    //   </AppBar>

    //   <Box
    //     sx={{
    //       p: 2,
    //       flex: 1,
    //     }}
    //   >
    //     {children}
    //   </Box>

    //   <Box sx={{ display: "flex", p: 2 }}>
    //     <Button
    //       variant="outlined"
    //       sx={{ flex: 1, marginRight: 2 }}
    //       {...backButtonProps}
    //     />
    //     <LoadingButton
    //       sx={{ flex: 1 }}
    //       fullWidth
    //       variant="contained"
    //       size="large"
    //       type="submit"
    //       {...nextButtonProps}
    //     />
    //   </Box>
    // </Box>
  );
};

export default ProfileCreate;
