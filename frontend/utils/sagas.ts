import { put, takeEvery } from "redux-saga/effects";
import { Action, isActions } from ".";

const actions = {
  error: Action<
    "utility",
    "error",
    {
      type: "unknown-action";
      action: unknown;
    }
  >("utility", "error"),
};

export function* logUnknownActionsSaga<TAction>({
  isAction,
}: {
  isAction: (action: unknown) => action is TAction;
}) {
  const isStoreAction = (action: unknown) => {
    return isActions(actions, action) || isAction(action);
  };

  function* watchUnknownActions(action: unknown) {
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
