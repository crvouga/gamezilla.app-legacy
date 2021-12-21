import { Container } from "@mui/material";
import React from "react";
import { useAppSelector } from "./hooks";
import { Route, Routes } from "react-router-dom";
import { auth } from "src/features";
import { HomePage } from "src/pages";
import { AccountPage } from "src/pages/account";
import { GameIdPage } from "src/pages/game/:id";
import { ProfilePage } from "src/pages/profile/:userId";
import { SignInPage } from "src/pages/sign-in";
import { SignOutPage } from "src/pages/sign-out";
import { LoadingDialog } from "src/components/LoadingDialog";

const SwitchAuth = ({
  signedIn,
  signedOut,
  loading,
}: {
  signedOut: React.ReactNode;
  signedIn: React.ReactNode;
  loading: React.ReactNode;
}) => {
  const authState = useAppSelector(auth.selectors.slice);

  switch (authState.type) {
    case "signed-in":
      return <>{signedIn}</>;

    case "signed-out":
      return <>{signedOut}</>;

    case "loading":
      return <>{loading}</>;
  }
};

export default function App() {
  return (
    <Container maxWidth="xs" disableGutters>
      <SwitchAuth
        loading={<LoadingDialog open />}
        signedOut={<SignInPage />}
        signedIn={(
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:id" element={<GameIdPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-out" element={<SignOutPage />} />
          </Routes>
        )}
      />
    </Container>
  );
}
