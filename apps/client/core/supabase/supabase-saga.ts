import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import { auth, IAuthState } from "../auth";
import { supabase } from "./supabase";

export const authStateChannel = eventChannel<IAuthState>((emit) => {
  emit({
    type: "loading",
  });

  if (!supabase.auth.session()) {
    emit({
      type: "signed-out",
    });
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case "PASSWORD_RECOVERY":
      case "SIGNED_IN":
      case "USER_UPDATED":
        emit({
          type: "signed-in",
          user: {
            userId: session.user.id,
          },
        });
        return;

      case "SIGNED_OUT":
      case "USER_DELETED":
        emit({
          type: "signed-out",
        });
        return;
    }
  });

  return () => {
    data.unsubscribe();
  };
});

export function* supabaseSaga() {
  yield takeEvery(authStateChannel, function* (authState) {
    yield put(auth.actions.setState(authState));
  });

  yield takeEvery(auth.actions.signOut, function* () {
    yield call(() => supabase.auth.signOut());
  });

  yield takeEvery(auth.actions.signIn, function* (action) {
    switch (action.payload.type) {
      case "google":
        yield call(() => supabase.auth.signIn({ provider: "google" }));
    }
  });
}
