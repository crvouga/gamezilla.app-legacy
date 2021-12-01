import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { reducer, saga } from "../features";
import { supabaseServices } from "../data-access";

export const createStore = () => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer,
    middleware: [sagaMiddleware],
  });

  sagaMiddleware.run(saga, {
    signIn: supabaseServices.signIn,
    signOut: supabaseServices.signOut,
    onAuthState: supabaseServices.onAuthState,
    onProfile: supabaseServices.onProfile,
    updateProfile: supabaseServices.updateProfile,
    findElseCreateProfile: supabaseServices.findElseCreateProfile,
    createGame: async ({ userId, gameId }) => {
      console.log({ createGame: { userId, gameId } });
      return null;
    },
  });

  return {
    store,
  };
};
