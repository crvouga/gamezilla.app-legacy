import {
  createAction as createActionReduxToolkit,
  PrepareAction,
} from "@reduxjs/toolkit";

const toActionType = (namespace: string, type: string) => {
  return `${namespace}/${type}`;
};

export const createAction = <TPayload>(namespace: string, type: string) => {
  return createActionReduxToolkit<PrepareAction<TPayload>>(
    toActionType(namespace, type),
    (payload: TPayload) => {
      return {
        payload,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  );
};
