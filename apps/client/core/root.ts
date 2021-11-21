import { combineReducers } from "@reduxjs/toolkit";
import { spawn } from "redux-saga/effects";

import { auth, IAuthServices } from "./auth";
import { profile, IProfileServices } from "./profile";

export const actions = {
  [auth.name]: auth.actions,
  [profile.name]: profile.actions,
};

export const selectors = {
  [auth.name]: auth.selectors,
  [profile.name]: profile.selectors,
};

export const reducer = combineReducers({
  [profile.name]: profile.reducer,
  [auth.name]: auth.reducer,
});

export type IAppServices = IAuthServices & IProfileServices;

export function* saga(services: IAppServices) {
  yield spawn(auth.saga, services);
  yield spawn(profile.saga, services);
}
