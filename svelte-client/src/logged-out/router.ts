import { readable } from "svelte/store";
type Route =
  | {
      type: "root";
    }
  | {
      type: "login-with-phone";
    };

const toPathname = (state: Route) => {
  switch (state.type) {
    case "root":
      return "/";

    case "login-with-phone":
      return "/login-with-phone";
  }
};

const toRoute = ({ pathname }: { pathname: string }): Route => {
  if (pathname === toPathname({ type: "login-with-phone" })) {
    return {
      type: "login-with-phone",
    };
  }

  return {
    type: "root",
  };
};

export const routeStore = readable<Route>({ type: "root" }, (set) => {
  const onLocationChange = () => {
    set(toRoute({ pathname: window.location.pathname }));
  };

  window.addEventListener("popstate", onLocationChange);

  return () => {
    window.removeEventListener("popstate", onLocationChange);
  };
});

export const pushRoute = (route: Route) => {
  window.history.pushState({}, "", toPathname(route));

  const event = new PopStateEvent("popstate");

  window.dispatchEvent(event);
};
