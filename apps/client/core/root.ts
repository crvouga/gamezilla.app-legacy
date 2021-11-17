import { combineReducers } from "@reduxjs/toolkit";
import { fork } from "redux-saga/effects";
import { auth, authSaga } from "./auth";
import { signOut, signIn, onAuthState } from "../supabase";

export const actions = {
  [auth.name]: auth.actions,
};

export const selectors = {
  [auth.name]: auth.selectors,
};

export function* saga() {
  yield fork(authSaga, {
    signOut,
    signIn,
    onAuthState,
  });
}

export const reducer = combineReducers({
  [auth.name]: auth.reducer,
});
