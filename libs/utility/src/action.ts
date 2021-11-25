import { createAction as createActionReduxToolkit } from "@reduxjs/toolkit";

export const createAction = <TPayload = undefined>(
  namespace: string,
  actionType: string
) => {
  return createActionReduxToolkit<TPayload>(`[${namespace}] ${actionType}`);
};
