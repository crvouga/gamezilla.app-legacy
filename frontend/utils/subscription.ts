export type IUnsubsribe = () => void;
export type ISubscription<TData> = (on: (data: TData) => void) => IUnsubsribe;
