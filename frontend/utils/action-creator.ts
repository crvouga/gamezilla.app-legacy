// source: https://warhol.io/blog/reducing-redux-boilerplate-in-typescript

type IActionCreatorMap = Record<string, (...args: any[]) => any>;

export type InferActionMap<TActionCreatorMap extends IActionCreatorMap> = {
  [Name in keyof TActionCreatorMap]: TActionCreatorMap[Name] extends (
    ...args: any[]
  ) => any
    ? ReturnType<TActionCreatorMap[Name]>
    : never;
};

export type InferActionUnion<TActionCreatorMap extends IActionCreatorMap> =
  InferActionMap<TActionCreatorMap>[keyof TActionCreatorMap];

/*



*/

export type IActionType = <TNamespace extends string, TType extends string>(
  namespace: TNamespace,
  type: TType
) => `${TNamespace}::${TType}`;

export const ActionType: IActionType = (namespace, type) => {
  return `${namespace}::${type}`;
};

export type IAction = <
  TNamespace extends string,
  TType extends string,
  TPayload = void
>(
  namespace: TNamespace,
  type: TType
) => (payload: TPayload) => {
  (payload: TPayload): {
    readonly namespace: TNamespace;
    readonly type: `[${TNamespace}] ${TType}`;
    readonly payload: TPayload;
  };
  toString(): `[${TNamespace}] ${TType}`;
  is(action: unknown): action is {
    readonly namespace: TNamespace;
    readonly type: `[${TNamespace}] ${TType}`;
    readonly payload: TPayload;
  };
};

export const Action = <
  TNamespace extends string,
  TType extends string,
  TPayload = void
>(
  namespace: TNamespace,
  type: TType
) => {
  const actionType = ActionType(namespace, type);

  const actionCreator = (payload: TPayload) => {
    return {
      namespace,
      type: actionType,
      payload,
    } as const;
  };

  actionCreator.toString = function () {
    return actionType;
  };

  type IAction = ReturnType<typeof actionCreator>;

  actionCreator.is = (action: unknown): action is IAction => {
    return (
      (action as IAction).namespace === namespace &&
      (action as IAction).type === actionType
    );
  };

  return actionCreator;
};

const or = (x1: boolean, x2: boolean) => x1 || x2;

export const isActions = (
  actionCreatorMap: Record<string, any>,
  action: unknown
): action is IAction => {
  return Object.entries(actionCreatorMap)
    .map(([_, actionCreator]) => actionCreator.is(action))
    .reduce(or);
};
