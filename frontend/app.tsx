import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Room } from "colyseus.js";
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AccountRoutes from "./features/account/AccountRoutes";
import { onAuthState } from "./features/account/account-data-access";
import AccountLogin from "./features/account/AccountLogin";
import AccountLogout from "./features/account/AccountLogout";
import { gameDataAccess } from "./features/game/game-data-access";
import GameConnectedRoutes from "./features/game/GameConnectedRoutes";
import GameDisconnectedRoutes from "./features/game/GameDisconnectedRoutes";
import Home from "./features/home/Home";
import ProfileRoutes from "./features/profile/ProfileRoutes";
import ProfileCreate from "./features/profile/profile-create/ProfileCreate";
import { IProfile, onProfile } from "./features/profile/profile-data-access";
import ThemeProvider from "./features/theme/ThemeProvider";
import { useStorageLocalJSON, useSubscription } from "./utils";
import { Provider } from "react-redux";
import { appStore } from "./app-store";

const App = () => {
  return (
    <Provider store={appStore}>
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <ThemeProvider>
            <Layout>
              <LoadAuth />
            </Layout>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

const LoadAuth = () => {
  const subscription = useSubscription(onAuthState);

  if (subscription.status === "loading") {
    return <Splash subtitle="Checking if logged in..." />;
  }

  const authState = subscription.data;

  if (authState.type === "logged-in") {
    return (
      <LoadProfile
        defaultName={authState.userMetadata.name ?? ""}
        userId={authState.userId}
      />
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<AccountLogin />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const LoadProfile = ({
  userId,
  defaultName,
}: {
  defaultName: string;
  userId: string;
}) => {
  const subscription = useSubscription(onProfile({ userId }));

  if (subscription.status === "loading") {
    return <Splash subtitle="Loading profile..." />;
  }

  const profile = subscription.data;

  if (profile) {
    return <LoadGameRoom profile={profile} />;
  }

  return (
    <Routes>
      <Route
        path="/profile/create/*"
        element={<ProfileCreate defaultName={defaultName} userId={userId} />}
      />
      <Route path="/logout" element={<AccountLogout />} />
      <Route path="*" element={<Navigate to="/profile/create" replace />} />
    </Routes>
  );
};

const LoadGameRoom = ({ profile }: { profile: IProfile }) => {
  const [roomIds, setRoomIds] = useStorageLocalJSON<null | {
    sessionId: string;
    roomId: string;
  }>("gameRoomIds", null);

  const [state, setState] = useState<
    | { type: "loading" }
    | { type: "in-room"; room: Room<unknown> }
    | { type: "not-in-room" }
  >(roomIds ? { type: "loading" } : { type: "not-in-room" });

  useEffect(() => {
    if (roomIds) {
      const reconnect = async () => {
        const result = await gameDataAccess.reconnect(roomIds);
        console.log({ result });
        if (result.type === "success") {
          setState({
            type: "in-room",
            room: result.data,
          });
          return;
        }

        if (result.type === "error") {
          setRoomIds(null);
          setState({
            type: "not-in-room",
          });
          return;
        }

        setState({
          type: "not-in-room",
        });
      };
      reconnect();
    }
  }, []);

  const onCreate = async () => {
    const result = await gameDataAccess.create();

    if (result.type === "success") {
      const room = result.data;
      setState({
        type: "in-room",
        room,
      });
      setRoomIds({
        sessionId: room.sessionId,
        roomId: room.id,
      });
      return;
    }
  };

  const onJoin = () => {
    console.log("onJoin");
  };

  if (state.type === "loading") {
    return <Splash subtitle="Checking if in a game..." />;
  }

  if (state.type === "in-room") {
    const { room } = state;

    const onLeave = async () => {
      await room.leave(true);
      setState({ type: "not-in-room" });
    };

    return (
      <Routes>
        <Route
          path="/game/*"
          element={<GameConnectedRoutes onLeave={onLeave} room={state.room} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home profile={profile} />} />
      <Route path="/account/*" element={<AccountRoutes />} />
      <Route path="/profile/*" element={<ProfileRoutes profile={profile} />} />
      <Route
        path="/game/*"
        element={<GameDisconnectedRoutes onJoin={onJoin} onCreate={onCreate} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
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
