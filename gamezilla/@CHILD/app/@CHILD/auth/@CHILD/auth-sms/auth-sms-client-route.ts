import { PhoneNumber } from "gamezilla/@SHARED/core";

//
//
//
// Model
//
//
//

export type Route = { t: "/" } | { t: "/verify"; phoneNumber: PhoneNumber };

const encode = (route: Route): string => {
  switch (route.t) {
    case "/":
      return "/";
    case "/verify":
      return "/verify?phoneNumber=" + route.phoneNumber;
  }
};

const decode = (
  pathname: string,
  queryParams: Record<string, unknown>
): Route | null => {
  if (pathname.includes("verify")) {
    const phoneNumber = String(queryParams.phoneNumber);
    const decoded = PhoneNumber.decode("US", phoneNumber);
    if (decoded.t === "err") {
      return null;
    }
    return { t: "/verify", phoneNumber: decoded.value };
  }

  if (pathname === "/") {
    return { t: "/" };
  }

  return null;
};

export const Route = {
  encode,
  decode,
};
