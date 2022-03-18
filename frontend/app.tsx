import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { AppRoutingNotFound } from "./app-routing";
import { useAppSelector } from "./app-store";
import Account from "./features/account/Account";
import AccountLogin from "./features/account/AccountLogin";
import AccountLogout from "./features/account/AccountLogout";
import GameConnected from "./features/game/GameConnected";
import GameLeave from "./features/game/GameLeave";
import Home from "./features/home/Home";
import { IProfile } from "./features/profile/profile-data-access";
import ProfileCreate from "./features/profile/ProfileCreate";

const App = () => {
  return (
    <Layout>
      <LoadAccount />
    </Layout>
  );
};

const LoadAccount = () => {
  const account = useAppSelector((state) => state.account);

  switch (account.type) {
    case "loading":
      return <Splash subtitle="Checking if logged in..." />;

    case "logged-in":
      return <LoadProfile userId={account.userId} />;

    case "logging-out":
      return <Splash subtitle="Logging out..." />;

    case "logged-out":
      return <AccountLogin />;

    case "logging-in":
      return <AccountLogin loading />;
  }
};

const LoadProfile = ({ userId }: { userId: string }) => {
  const profile = useAppSelector((state) => state.profile);
  const routing = useAppSelector((state) => state.routing);

  switch (profile.type) {
    case "loading":
      return <Splash subtitle="Loading profile..." />;

    case "not-found":
      switch (routing.route.type) {
        case "profile":
          switch (routing.route.child.type) {
            case "create":
              return <ProfileCreate defaultName={""} userId={userId} />;
            default:
              return <AccountLogout />;
          }
        default:
          return <AccountLogout />;
      }

    case "found":
      return <LoadGameRoom profile={profile.profile} />;
  }
};

const LoadGameRoom = ({ profile }: { profile: IProfile }) => {
  const game = useAppSelector((state) => state.game);
  const routing = useAppSelector((state) => state.routing);

  switch (game.type) {
    case "loading":
      return <Splash subtitle="Checking if in a game..." />;

    case "connected":
      switch (game.route.type) {
        case "home":
          return <GameConnected />;

        case "leave":
          return <GameLeave />;
      }

    case "disconnected":
      switch (routing.route.type) {
        case "home":
          return <Home profile={profile} />;

        case "account":
          switch (routing.route.child.type) {
            case "home":
              return <Account />;

            case "login":
              return <AccountLogin />;

            case "logout":
              return <AccountLogout />;
          }

        case "profile":
          return <>profile stuff</>;

        default:
          return <AppRoutingNotFound />;
      }
  }
};

const Splash = ({ subtitle }: { subtitle: string }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h3" color="primary.main">
          Gamezilla
        </Typography>
        <Typography align="center" variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (isSmallScreen) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        margin: "auto",
        width: "100%",
        maxWidth: 500,
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "1rem",
          backgroundColor: theme.palette.background.default,
          width: "100%",
          height: "100%",
          maxHeight: 500 * (16 / 9),
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default App;
