import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RestoreIcon from "@mui/icons-material/Restore";
import { Person } from "@mui/icons-material";
import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import React, { useRef } from "react";
import { Outlet, ReactLocation, Router } from "react-location";
import { Alert, Backdrop } from "./components";
import { onAuthStatus, onUserStatus } from "./data-access";
import {
  EditAvatarPage,
  EditProfilePage,
  HomePage,
  LoginPage,
  LogoutPage,
  TicTacToePage,
} from "./pages";
import { Splash } from "./pages/Splash";
import { useSubscription } from "./utility";

export const App = () => {
  const authState = useSubscription({ type: "loading" }, onAuthStatus);

  if (authState.type === "loading") {
    return <Splash />;
  }

  if (authState.type === "logged-out") {
    return <LoginPage />;
  }

  return <LoggedIn userId={authState.userId} />;
};

const LoggedIn = ({ userId }: { userId: string }) => {
  const userStatus = useSubscription(
    { type: "loading" },
    onUserStatus({ userId })
  );

  const locationRef = useRef(new ReactLocation());

  if (userStatus.type === "loading") {
    return <Splash />;
  }

  if (userStatus.type === "error") {
    return (
      <Backdrop>
        <Alert variant="error" title="Failed to load your profile" />
      </Backdrop>
    );
  }

  const { profile } = userStatus;

  return (
    <Router
      location={locationRef.current}
      routes={[
        {
          path: "/",
          element: <Root profile={profile} />,
          children: [
            {
              path: "/home",
              element: <HomePage profile={profile} />,
            },
            {
              path: "/profile/edit",
              element: <EditProfilePage profile={profile} />,
            },
            {
              path: "/profile/avatar/edit",
              element: <EditAvatarPage profile={profile} />,
            },
          ],
        },

        {
          path: "/logout",
          element: <LogoutPage username={profile.displayName ?? "user123"} />,
        },
        {
          path: "/tic-tac-toe",
          element: <TicTacToePage />,
        },
      ]}
    />
  );
};

export const Root = ({ profile }: { profile: { avatarUrl?: string } }) => {
  const [value, setValue] = React.useState(0);

  return (
    <>
      <Outlet />

      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
        <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Profile" icon={<Person />} />
      </BottomNavigation>
    </>
  );
};
