import { combineReducers } from "@reduxjs/toolkit";
import { fork } from "redux-saga/effects";
import { auth } from "./auth";
import { firebaseSaga } from "./firebase/firebase-saga";

export const actions = {
  [auth.name]: auth.actions,
};

export const selectors = {
  [auth.name]: auth.selectors,
};

export function* saga() {
  yield fork(firebaseSaga);
}

export const reducer = combineReducers({
  [auth.name]: auth.reducer,
});
