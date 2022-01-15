import { useEffect } from "react";
import { useState } from "react";

type State =
  | {
      route: "home";
    }
  | {
      route: "edit-profile";
    }
  | {
      route: "edit-avatar";
    }
  | {
      route: "search-users";
    };

const toPathname = (state: State) => {
  switch (state.route) {
    case "home":
      return "/";

    case "edit-profile":
      return "/edit-profile";

    case "edit-avatar":
      return "/edit-avatar";
    
    case "search-users":
      return "/search-users";
  }
};

const toState = ({ pathname }: { pathname: string }): State => {
  if (pathname === "/") {
    return {
      route: "home",
    };
  }

  if (pathname === "/edit-profile") {
    return {
      route: "edit-profile",
    };
  }

  if (pathname === "/edit-avatar") {
    return {
      route: "edit-avatar",
    };
  }

  if(pathname === '/search-users') {
    return {
      route: "search-users"
    }
  }

  return {
    route: "home",
  };
};

export const useRouter = () => {
  const [state, setState] = useState<State>(() => {
    return toState({ pathname: window.location.pathname });
  });

  useEffect(() => {
    const onLocationChange = () => {
      setState(toState({ pathname: window.location.pathname }));
    };

    window.addEventListener("popstate", onLocationChange);

    return () => {
      window.removeEventListener("popstate", onLocationChange);
    };
  }, []);

  const push = (state: State) => {
    window.history.pushState({}, "", toPathname(state));

    const event = new PopStateEvent("popstate");

    window.dispatchEvent(event);
  };

  return {
    route: state.route,
    push,
  };
};
