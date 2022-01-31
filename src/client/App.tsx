import { Chat, Home, Person, Search } from "@mui/icons-material";
import {
  Alert,
  Backdrop,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import React, { useRef } from "react";
import { ReactLocation, Router } from "react-location";
import { LinkBehavior } from "./components/Link";
import { onAuthStatus, onUserStatus } from "./data-access";
import { AccountPage } from "./pages/Account";
import { EditProfileAvatarPage } from "./pages/EditProfileAvatar";
import { EditProfilePage } from "./pages/EditProfile";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { LogoutPage } from "./pages/Logout";
import { ProfilePage } from "./pages/Profile";
import { Splash } from "./pages/Splash";
import { TicTacToePage } from "./pages/TicTacToe";
import { useSubscription } from "./utility";
import { EditProfileNamePage } from "./pages/EditProfileName";
import { EditProfileUsernamePage } from "./pages/EditProfileUsername";

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
    {
      type: "loading",
    },
    onUserStatus({ userId })
  );

  const locationRef = useRef(new ReactLocation());

  if (userStatus.type === "loading") {
    return <Splash />;
  }

  if (userStatus.type === "error") {
    return (
      <Backdrop open>
        <Alert sx={{ m: 4 }} variant="filled" severity="error">
          Something went wrong when trying to load your profile.
        </Alert>
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
          children: [
            {
              path: "/",
              element: (
                <RootLayout>
                  <ProfilePage profile={profile} />
                </RootLayout>
              ),
            },
            {
              path: "/edit",
              children: [
                {
                  path: "/",
                  element: <EditProfilePage profile={profile} />,
                },
                {
                  path: "/avatar",
                  element: <EditProfileAvatarPage profile={profile} />,
                },
                {
                  path: "/name",
                  element: <EditProfileNamePage profile={profile} />,
                },
                {
                  path: "/username",
                  element: <EditProfileUsernamePage profile={profile} />,
                },
              ],
            },
          ],
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
        <BottomNavigationAction
          LinkComponent={LinkBehavior}
          label="Home"
          href="/"
          icon={<Home />}
        />
        <BottomNavigationAction
          LinkComponent={LinkBehavior}
          href="/chat"
          label="Chat"
          icon={<Chat />}
        />
        <BottomNavigationAction
          LinkComponent={LinkBehavior}
          href="/search"
          label="Search"
          icon={<Search />}
        />
        <BottomNavigationAction
          LinkComponent={LinkBehavior}
          href="/profile"
          label="Profile"
          icon={<Person />}
        />
      </BottomNavigation>
    </>
  );
};
