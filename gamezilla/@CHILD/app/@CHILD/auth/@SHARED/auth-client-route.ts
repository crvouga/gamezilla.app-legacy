//
//
//
// Model
//
//
//

import { Location } from "gamezilla/@CHILD/app/@SHARED/client";

export type Route =
  | {
      t: "/";
      c: Location;
    }
  | {
      t: "/sms";
      c: Location;
    };

const encode = (route: Route): string => {
  switch (route.t) {
    case "/":
      return "/";
    case "/sms":
      return "/sms";
  }
};

const decode = (pathname: string): Route | null => {
  if (pathname.startsWith("/sms")) {
    const child = pathname.slice(4);

    return {
      t: "/sms",
      c: {
        pathname: child,
        search: "",
      },
    };
  }

  if (pathname === "/") {
    return {
      t: "/",
      c: {
        pathname: "/",
        search: "",
      },
    };
  }

  return null;
};

export const toRoute = (location: Location): Route => {
  const route = decode(location.pathname);
  if (route === null) {
    return {
      t: "/",
      c: location,
    };
  }
  return route;
};

export const Route = {
  encode,
  decode,
};
