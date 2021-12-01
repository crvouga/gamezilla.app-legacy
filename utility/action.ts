import {
  createAction as createActionReduxToolkit,
  PrepareAction,
} from "@reduxjs/toolkit";

const formatType = (namespace: string, type: string) => {
  return `${namespace}/${type}`;
};

export const createAction = <TPayload>(namespace: string, type: string) => {
  return createActionReduxToolkit<PrepareAction<TPayload>>(
    formatType(namespace, type),
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
