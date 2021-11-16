import { eventChannel } from "redux-saga";
import { call, takeEvery, put } from "redux-saga/effects";
import {
  signOut,
  signInWithRedirect,
  GoogleAuthProvider,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import { firebaseApp } from "./firebase";
import { IAuthState, auth } from "../auth";

const firebaseAuth = getAuth(firebaseApp);

const authStateChannel = eventChannel<IAuthState>((emit) => {
  emit({
    type: "loading",
  });
  return onAuthStateChanged(firebaseAuth, (authState) => {
    if (authState) {
      emit({
        type: "signed-in",
        user: {
          userId: authState.uid,
        },
      });
      return;
    }

    emit({
      type: "signed-out",
    });
  });
});

export function* firebaseSaga() {
  yield takeEvery(authStateChannel, function* (authState) {
    yield put(auth.actions.setState(authState));
  });

  yield takeEvery(auth.actions.signOut, function* () {
    yield call(() => {
      signOut(firebaseAuth);
    });
  });

  yield takeEvery(auth.actions.signIn, function* (action) {
    switch (action.payload.type) {
      case "google":
        yield call(() => {
          const provider = new GoogleAuthProvider();

          signInWithRedirect(firebaseAuth, provider);
        });
    }
  });
}
