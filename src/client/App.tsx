import { Chat, Home, Person, Search } from "@mui/icons-material";
import {
  Alert,
  Backdrop,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import React, { useRef } from "react";
import { ReactLocation, Router } from "react-location";
import { onAuthStatus, onUserStatus } from "./data-access";
import { AccountPage } from "./pages/Account";
import { EditAvatarPage } from "./pages/EditAvatar";
import { EditProfilePage } from "./pages/EditProfile";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { LogoutPage } from "./pages/Logout";
import { ProfilePage } from "./pages/Profile";
import { Splash } from "./pages/Splash";
import { TicTacToePage } from "./pages/TicTacToe";
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
      <Backdrop open>
        <Alert severity="error">Failed to load your profile</Alert>
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
          element: (
            <RootLayout>
              <HomePage profile={profile} />
            </RootLayout>
          ),
        },
        {
          path: "/account",
          element: <AccountPage profile={profile} />,
        },
        {
          path: "/profile",
          element: (
            <RootLayout>
              <ProfilePage profile={profile} />
            </RootLayout>
          ),
        },
        {
          path: "/profile/edit",
          element: (
            <RootLayout>
              <EditProfilePage profile={profile} />
            </RootLayout>
          ),
        },
        {
          path: "/profile/avatar/edit",
          element: (
            <RootLayout>
              <EditAvatarPage profile={profile} />
            </RootLayout>
          ),
        },
        {
          path: "/logout",
          element: <LogoutPage profile={profile} />,
        },
        {
          path: "/tic-tac-toe",
          element: <TicTacToePage />,
        },
      ]}
    />
  );
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = React.useState(0);

  return (
    <>
      {children}

      <BottomNavigation
        sx={{
          position: "fixed",
          right: 0,
          bottom: 0,
          left: 0,
        }}
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="Home" href="/" icon={<Home />} />
        <BottomNavigationAction href="/chat" label="Chat" icon={<Chat />} />
        <BottomNavigationAction
          href="/search"
          label="Search"
          icon={<Search />}
        />
        <BottomNavigationAction
          href="/profile"
          label="Profile"
          icon={<Person />}
        />
      </BottomNavigation>
    </>
  );
};
