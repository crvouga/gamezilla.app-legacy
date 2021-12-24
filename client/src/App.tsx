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
import {
  IProfile,
  profileDataAccess,
} from "./features/account/profile/profile-data-access";
import { GameInvitePage } from "./features/game/GameInvitePage";
import { definitions, supabaseClient } from "./supabase";

type IAuthState =
  | {
      type: "logged-in";
      userId: string;
    }
  | {
      type: "logged-out";
    }
  | {
      type: "loading";
    };

const subscribeAuthState = (
  emit: (event: IAuthState) => void
): (() => void) => {
  emit({
    type: "loading",
  });

  setTimeout(() => {
    const session = supabaseClient.auth.session();
    if (session?.user?.id) {
      emit({ type: "logged-in", userId: session.user.id });
      return;
    }

    emit({ type: "logged-out" });
  }, 1000);

  const response = supabaseClient.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case "PASSWORD_RECOVERY":
      case "USER_UPDATED":
      case "TOKEN_REFRESHED":
      case "SIGNED_IN":
        if (session?.user?.id) {
          emit({
            type: "logged-in",
            userId: session.user.id,
          });
        } else {
          emit({
            type: "logged-out",
          });
        }
        return;

      case "SIGNED_OUT":
      case "USER_DELETED":
        emit({
          type: "logged-out",
        });
        return;
    }
  });
  return () => {
    response.data?.unsubscribe();
  };
};

type IProfileState =
  | {
      type: "loading";
    }
  | {
      type: "loaded";
      profile: IProfile;
    };

const subscribeProfileState = ({ userId }: { userId: string }) => (
  emit: (profile: IProfileState) => void
): (() => void) => {
  emit({
    type: "loading",
  });

  profileDataAccess.fetchElseCreate({ userId }).then((profile) => {
    if (profile) {
      emit({
        type: "loaded",
        profile,
      });
    }
  });

  const response = supabaseClient
    .from<definitions["profiles"]>(`profiles:id=eq.${userId}`)
    .on("*", (payload) => {
      emit({
        type: "loaded",
        profile: {
          userId: payload.new.id,
          avatarUrl: payload.new.avatar_url,
          displayName: payload.new.display_name,
        },
      });
    })
    .subscribe();

  return () => {
    response.unsubscribe();
  };
};

const useSubscription = <T,>(
  subscribe: (emit: (data: T) => void) => () => void,
  initial: T
) => {
  const [data, setData] = useState<T>(initial);
  useEffect(() => subscribe(setData), []);
  return data;
};

const LoggedInApp = ({ userId }: { userId: string }) => {
  const profileState = useSubscription(subscribeProfileState({ userId }), {
    type: "loading",
  });

  return (
    <>
      {profileState.type === "loading" && (
        <LoadingDialog open title="Loading Profile" />
      )}

      {profileState.type === "loaded" && (
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
    </>
  );
};

export const App = () => {
  const authState = useSubscription(subscribeAuthState, { type: "loading" });

  return (
    <Container maxWidth="xs" disableGutters>
      {authState.type === "loading" && (
        <LoadingDialog open title="Logging In" />
      )}

      {authState.type === "logged-out" && <SignInPage />}

      {authState.type === "logged-in" && (
        <LoggedInApp userId={authState.userId} />
      )}
    </Container>
  );
};
