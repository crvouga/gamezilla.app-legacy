import { generateId } from "@gamezilla/utility";
import { createAction, createReducer } from "@reduxjs/toolkit";
import { delay, takeEvery, put } from "redux-saga/effects";

export type IToast = {
  id: string;
  message: string;
  duration?: number;
};

export type IToastState = IToast[];

const name: "toast" = "toast";

const actions = {
  enqueue: createAction<IToast>(`${name}/enqueue`),
  dequeue: createAction<{ id: string }>(`${name}/dequeue`),
  //
  present: createAction<{ message: string; duration?: number }>(
    `${name}/present`
  ),
  dismiss: createAction<{ id: string }>(`${name}/dismiss`),
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
    const toast: IToast = {
      id: generateId(),
      message: action.payload.message,
      duration: action.payload.duration,
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
