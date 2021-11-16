import { takeEvery } from "redux-saga/effects";
import { actions } from "../root";

export function* firebaseSaga() {
  yield takeEvery(actions.auth.signIn, function* (action) {
    switch (action.payload.type) {
      case "google":
        console.log("FIREBASE logic");
    }
  });
}
