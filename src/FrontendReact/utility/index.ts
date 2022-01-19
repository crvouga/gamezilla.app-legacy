import { useEffect, useState } from "react";

export const mapValues = <TK extends string | number | symbol, TX, TY>(
  object: Record<TK, TX>,
  f: (x: TX) => TY
): Record<TK, TY> => {
  const entries = Object.entries(object) as [TK, TX][];

  const initial = {} as Record<TK, TY>;

  return entries.reduce<Record<TK, TY>>(
    (object, [key, value]) => ({ ...object, [key]: f(value) }),
    initial
  );
};

export const useLocationState = <State>({
  encode,
  decode,
}: {
  decode: ({ pathname }: { pathname: string }) => State;
  encode: (route: State) => { pathname: string };
}) => {
  const [state, setState] = useState<State>(() => {
    return decode({ pathname: window.location.pathname });
  });

  useEffect(() => {
    const onLocationChange = () => {
      setState(decode({ pathname: window.location.pathname }));
    };

    window.addEventListener("popstate", onLocationChange);

    return () => {
      window.removeEventListener("popstate", onLocationChange);
    };
  }, []);

  const push = (state: State) => {
    const { pathname } = encode(state);

    window.history.pushState({}, "", pathname);

    const event = new PopStateEvent("popstate");

    window.dispatchEvent(event);
  };

  const pop = () => {
    window.history.back();
  };

  return {
    state,
    push,
    pop,
  };
};
