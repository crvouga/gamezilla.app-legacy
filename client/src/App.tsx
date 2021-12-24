import { Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingDialog } from "src/components/LoadingDialog";
import {
  AccountPage,
  AvatarEditPage,
  GamePage,
  HomePage,
  ProfileEditPage,
  SignInPage,
  SignOutPage,
} from "src/features";
import { GameInvitePage } from "./features/game/GameInvitePage";
import { supabaseClient } from "./supabase";

type IAuthState =
  | {
      type: "logged-in";
      // profile: {
      //   userId: string;
      //   displayName: string;
      //   avatarUrl: string;
      // };
    }
  | {
      type: "logged-out";
    }
  | {
      type: "loading";
    }
  | {
      type: "loading-profile";
    };

const useAuthState = () => {
  const [authState, setAuthState] = useState<IAuthState>({ type: "loading" });

  useEffect(() => {
    supabaseClient.auth.onAuthStateChange((event) => {
      switch (event) {
        case "PASSWORD_RECOVERY":
        case "USER_UPDATED":
        case "TOKEN_REFRESHED":
        case "SIGNED_IN":
          setAuthState({
            type: "logged-in",
          });
          return;

        case "SIGNED_OUT":
        case "USER_DELETED":
          setAuthState({
            type: "logged-out",
          });
          return;
      }
    });
  }, [setAuthState]);

  return authState;
};

export const App = () => {
  const authState = useAuthState();

  return (
    <Container maxWidth="xs" disableGutters>
      {authState.type === "loading" && <LoadingDialog open />}

      {authState.type === "logged-out" && <SignInPage />}

      {authState.type === "logged-in" && (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/game/:id/invite" element={<GameInvitePage />} />;
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/avatar/edit" element={<AvatarEditPage />} />;
          <Route path="/account" element={<AccountPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-out" element={<SignOutPage />} />
        </Routes>
      )}
    </Container>
  );
};
