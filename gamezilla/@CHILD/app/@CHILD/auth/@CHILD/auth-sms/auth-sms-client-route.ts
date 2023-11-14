import { Location } from "gamezilla/@CHILD/app/@SHARED/client";
import { PhoneNumber } from "gamezilla/@SHARED/core";

//
//
//
// Model
//
//
//

export type Route = { t: "/" } | { t: "/verify"; phoneNumber: PhoneNumber };

export const toLocation = (route: Route): string => {
  switch (route.t) {
    case "/":
      return "/";
    case "/verify":
      return "/verify?phoneNumber=" + route.phoneNumber;
  }
};

export const toRoute = (location: Location): Route => {
  if (location.pathname.includes("verify")) {
    // return { t: "/verify", phoneNumber: decoded.value };
  }

  return { t: "/" };
};
