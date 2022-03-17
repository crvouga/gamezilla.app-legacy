import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAppSelector } from "./app-store";
import AccountLogin from "./features/account/AccountLogin";
import AccountLogout from "./features/account/AccountLogout";
import AccountRoutes from "./features/account/AccountRoutes";
import GameConnected from "./features/game/GameConnected";
import GameDisconnectedRoutes from "./features/game/GameDisconnectedRoutes";
import GameLeave from "./features/game/GameLeave";
import Home from "./features/home/Home";
import { IProfile } from "./features/profile/profile-data-access";
import ProfileCreate from "./features/profile/ProfileCreate";
import ProfileRoutes from "./features/profile/ProfileRoutes";

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
      return (
        <Routes>
          <Route
            path="/profile/create/*"
            element={<ProfileCreate defaultName={""} userId={userId} />}
          />
          <Route path="/logout" element={<AccountLogout />} />
          <Route path="*" element={<Navigate to="/profile/create" replace />} />
        </Routes>
      );

    case "found":
      return <LoadGameRoom profile={profile.profile} />;
  }
};

const LoadGameRoom = ({ profile }: { profile: IProfile }) => {
  const game = useAppSelector((state) => state.game);

  switch (game.type) {
    case "loading":
      return <Splash subtitle="Checking if in a game..." />;

    case "connected":
      switch (game.route) {
        case "/":
          return <GameConnected />;

        case "/leave":
          return <GameLeave />;
      }

    case "disconnected":
      return (
        <Routes>
          <Route path="/" element={<Home profile={profile} />} />
          <Route path="/account/*" element={<AccountRoutes />} />
          <Route
            path="/profile/*"
            element={<ProfileRoutes profile={profile} />}
          />
          <Route path="/game/*" element={<GameDisconnectedRoutes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
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
