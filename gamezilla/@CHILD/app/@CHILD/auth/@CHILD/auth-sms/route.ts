import { Location } from "gamezilla/@CHILD/app/@SHARED/client";
import { Iso3166Alpha2Code, PhoneNumber } from "gamezilla/@SHARED/core";

//
//
//
// Model
//
//
//

export type Route = { t: "/" } | { t: "/verify"; phoneNumber: PhoneNumber };

export const toLocation = (route: Route): Location => {
  switch (route.t) {
    case "/":
      return {
        pathname: "/",
      };

    case "/verify":
      const params = new URLSearchParams();
      params.append(
        "phoneNumberCountry",
        PhoneNumber.toCountry(route.phoneNumber)
      );
      params.append("phoneNumber", PhoneNumber.toString(route.phoneNumber));
      return { pathname: "/verify", searchParams: params };
  }
};

export const toRoute = (location: Location): Route => {
  if (location.pathname.includes("verify")) {
    const phoneNumberCountry = location.searchParams?.get("phoneNumberCountry");
    if (!Iso3166Alpha2Code.is(phoneNumberCountry)) {
      return { t: "/" };
    }
    const phoneNumber = location.searchParams?.get("phoneNumber");
    if (typeof phoneNumber !== "string") {
      return { t: "/" };
    }
    const parsed = PhoneNumber.decode(phoneNumberCountry, phoneNumber);
    if (parsed.t === "err") {
      return { t: "/" };
    }
    return {
      t: "/verify",
      phoneNumber: parsed.value,
    };
  }

  return { t: "/" };
};
