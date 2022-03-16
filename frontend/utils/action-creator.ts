// source: https://warhol.io/blog/reducing-redux-boilerplate-in-typescript

export type InferActionUnion<
  TActionCreators extends Record<string, (...args: any[]) => any>
> = {
  [Name in keyof TActionCreators]: TActionCreators[Name] extends (
    ...args: any[]
  ) => any
    ? ReturnType<TActionCreators[Name]>
    : never;
}[keyof TActionCreators];

export type InferActionMap<
  TActionCreators extends Record<string, (...args: any[]) => any>
> = {
  [Name in keyof TActionCreators]: TActionCreators[Name] extends (
    ...args: any[]
  ) => any
    ? ReturnType<TActionCreators[Name]>
    : never;
};

export const Action = <
  TNamespace extends string,
  TType extends string,
  TPayload = void
>(
  namespace: TNamespace,
  type: TType
) => {
  const namespacedType: `${TNamespace}::${TType}` = `${namespace}::${type}`;

  const actionCreator = (payload: TPayload) => {
    return {
      namespace,
      type: namespacedType,
      payload,
    } as const;
  };

  actionCreator.toString = function () {
    return namespacedType;
  };

  return actionCreator;
};
