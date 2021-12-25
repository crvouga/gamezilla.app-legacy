import { Container } from "@mui/material";
import React, { useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingDialog } from "src/components/LoadingDialog";
import {
  AccountPage,
  authDataAccess,
  AvatarPage,
  GameInvitePage,
  GamePage,
  HomePage,
  ProfileContextProvider,
  profileDataAccess,
  ProfileEditPage,
  SignInPage,
  SignOutPage,
} from "src/features";
import { useSubscription } from "./utility";

const LoggedInApp = ({ userId }: { userId: string }) => {
  const subscribe = useCallback(
    (emit: Parameters<typeof profileDataAccess.subscribe>[1]) =>
      profileDataAccess.subscribe({ userId }, emit),
    [userId]
  );

  const profileState = useSubscription(subscribe, {
    type: "loading",
  });

  return (
    <>
      {profileState.type === "loading" && (
        <LoadingDialog open title="Loading Profile" />
      )}

      {profileState.type === "loaded" && (
        <ProfileContextProvider profile={profileState.profile}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/game/:id/invite" element={<GameInvitePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-out" element={<SignOutPage />} />
            <Route path="/avatar/*" element={<AvatarPage />} />
          </Routes>
        </ProfileContextProvider>
      )}
    </>
  );
};

export const App = () => {
  const authState = useSubscription(authDataAccess.subscribe, {
    type: "loading",
  });

  return (
    <Container maxWidth="xs" disableGutters>
      {authState.type === "loading" && (
        <LoadingDialog open title="Checking Login" />
      )}

      {authState.type === "logged-out" && <SignInPage />}

      {authState.type === "logged-in" && (
        <LoggedInApp userId={authState.userId} />
      )}
    </Container>
  );
};
