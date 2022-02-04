import { Chat, Home, Person, Search } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { Route, Routes } from "react-router-dom";
import { LinkBehavior } from "./components/Link";
import {
  getAuthStatus,
  getElseCreateProfile,
  IAuthStatus,
  IProfile,
  onAuthStatus,
  onProfile,
} from "./data-access";
import { AccountPage } from "./pages/Account";
import { EditProfilePage } from "./pages/EditProfile";
import { EditProfileAvatarPage } from "./pages/EditProfileAvatar";
import { EditProfileNamePage } from "./pages/EditProfileName";
import { EditProfileUsernamePage } from "./pages/EditProfileUsername";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { LogoutPage } from "./pages/Logout";
import { Splash } from "./pages/Splash";
import { useSubscription } from "./utility";

export const App = () => {
  return <SubscribeAuth />;
};

const SubscribeAuth = () => {
  const authStatus = useSubscription({ type: "loading" }, onAuthStatus);

  switch (authStatus.type) {
    case "logged-out":
      return <LoginPage />;

    case "loading":
      return <Splash />;

    case "logged-in":
      const { userId } = authStatus;
      return <LoadUser userId={userId} />;
  }
};

const LoadUser = ({ userId }: { userId: string }) => {
  const query = useQuery(["user", userId], () =>
    getElseCreateProfile({ userId })
  );

  if (query.status === "success") {
    const profile = query.data;

    return <SubscribeUser initial={profile} />;
  }

  return <Splash />;
};

const SubscribeUser = ({ initial }: { initial: IProfile }) => {
  const profile = useSubscription(
    initial,
    onProfile({ userId: initial.userId })
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RootLayout>
            <HomePage profile={profile} />
          </RootLayout>
        }
      />
      <Route path="/account" element={<AccountPage profile={profile} />} />
      <Route path="/profile/edit">
        <Route path="" element={<EditProfilePage profile={profile} />} />
        <Route
          path="avatar/*"
          element={<EditProfileAvatarPage profile={profile} />}
        />
        <Route
          path="name"
          element={<EditProfileNamePage profile={profile} />}
        />
        <Route
          path="username"
          element={<EditProfileUsernamePage profile={profile} />}
        />
      </Route>
      <Route path="/logout" element={<LogoutPage profile={profile} />} />
    </Routes>
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
