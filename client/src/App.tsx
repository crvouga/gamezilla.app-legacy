import { Container } from "@mui/material";
import { combineReducers } from "@reduxjs/toolkit";
import React from "react";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { spawn } from "redux-saga/effects";
import { LoadingDialog } from "src/components/LoadingDialog";
import {
  AccountPage,
  auth,
  AvatarEditPage,
  game,
  GamePage,
  HomePage,
  profile,
  ProfileEditPage,
  SignInPage,
  SignOutPage,
} from "src/features";
import { GameInvitePage } from "./features/game/GameInvitePage";

/**
 *
 * State
 *
 */

export const appReducer = combineReducers({
  [auth.namespace]: auth.reducer,
  [profile.namespace]: profile.reducer,
});

export function* appSaga() {
  yield spawn(game.saga);
  yield spawn(auth.saga);
  yield spawn(profile.saga);
}

/**
 *
 * View
 *
 */

export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof appReducer>
> = useSelector;

export const App = () => {
  const authSlice = useAppSelector(auth.selectors.slice);
  return (
    <Container maxWidth="xs" disableGutters>
      {authSlice.type === "loading" && <LoadingDialog open />}

      {authSlice.type === "signed-out" && <SignInPage />}

      {authSlice.type === "signed-in" && (
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
