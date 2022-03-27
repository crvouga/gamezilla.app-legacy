import { Action, createAction } from "@reduxjs/toolkit";
import { put, takeEvery } from "redux-saga/effects";

type IError = {
  type: "unknown-action";
  action: unknown;
};

const actions = {
  error: createAction<IError, "utility/ERROR">("utility/ERROR"),
};

export function* logUnknownActionsSaga<TAction extends Action>({
  isAction,
}: {
  isAction: (action: Action<unknown>) => action is TAction;
}) {
  const isStoreAction = (action: Action<unknown>) => {
    return actions.error.match(action) || isAction(action);
  };

  function* watchUnknownActions(action: Action<unknown>) {
    if (isStoreAction(action)) {
      return;
    }

    yield put(
      actions.error({
        type: "unknown-action",
        action,
      })
    );
  }

  yield takeEvery("*", watchUnknownActions);
}
