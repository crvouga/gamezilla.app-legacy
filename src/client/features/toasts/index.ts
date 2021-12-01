import { Action, createReducer } from "@reduxjs/toolkit";
import { generateId } from "@utility";
import { createAction } from "../../../shared";
import { delay, put, takeEvery } from "redux-saga/effects";

export type IToast = {
  id: string;
  message: string;
  duration?: number;
  onDone?: Action;
};

export type IToastState = IToast[];

const name: "toast" = "toast";

const actions = {
  enqueue: createAction<IToast>(name, `enqueue`),
  dequeue: createAction<{ id: string }>(name, `dequeue`),
  //
  present: createAction<{ message: string; duration?: number }>(
    name,
    `present`
  ),
  dismiss: createAction<{ id: string }>(name, `dismiss`),
};

const selectors = {
  slice: (state: { [name]: IToastState }): IToastState => state[name],
};

const reducer = createReducer<IToastState>([], {
  [actions.enqueue.toString()]: (
    state,
    action: ReturnType<typeof actions.enqueue>
  ) => {
    return [...state, action.payload];
  },

  [actions.dequeue.toString()]: (
    state,
    action: ReturnType<typeof actions.dequeue>
  ) => {
    return state.filter((toast) => toast.id !== action.payload.id);
  },
});

export const toast = {
  name,
  actions,
  selectors,
  reducer,
};

export function* toastSaga() {
  yield takeEvery(actions.present, function* (action) {
    const toastId = generateId();
    const toast: IToast = {
      id: toastId,
      message: action.payload.message,
      duration: action.payload.duration,
      onDone: actions.dismiss({
        id: toastId,
      }),
    };

    yield put(actions.enqueue(toast));

    if (toast.duration) {
      yield delay(toast.duration);

      yield put(actions.dismiss(toast));
    }
  });

  yield takeEvery(actions.dismiss, function* (action) {
    yield put(actions.dequeue(action.payload));
  });
}
