import { Container } from "@mui/material";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingDialog } from "src/components/LoadingDialog";
import {
  AccountPage,
  authDataAccess,
  AvatarEditChoosePage,
  AvatarEditContext,
  AvatarEditMainPage,
  GameInvitePage,
  GamePage,
  HomePage,
  ProfileContext,
  ProfileEditPage,
  SignInPage,
  SignOutPage,
  useProfileState,
} from "src/features";
import { useSubscription } from "./utility";

const LoggedInApp = ({ userId }: { userId: string }) => {
  const profileState = useProfileState({ userId });

  return (
    <>
      {profileState.type === "loading" && (
        <LoadingDialog open title="Loading Profile" />
      )}

      {profileState.type === "loaded" && (
        <ProfileContext.Provider value={profileState.profile}>
          <AvatarEditContext>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/:id" element={<GamePage />} />
              <Route path="/game/:id/invite" element={<GameInvitePage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-out" element={<SignOutPage />} />
              <Route path="/avatar/edit" element={<AvatarEditMainPage />} />
              <Route
                path="/avatar/edit/choose"
                element={<AvatarEditChoosePage />}
              />
            </Routes>
          </AvatarEditContext>
        </ProfileContext.Provider>
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
        <LoadingDialog open title="Loading Login" />
      )}

      {authState.type === "logged-out" && <SignInPage />}

      {authState.type === "logged-in" && (
        <LoggedInApp userId={authState.userId} />
      )}
    </Container>
  );
};
