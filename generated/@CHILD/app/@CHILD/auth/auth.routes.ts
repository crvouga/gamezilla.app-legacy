import { PhoneNumber } from "gamezilla-app/@SHARED/core";
import { P } from "gamezilla-app/@SHARED/parsing";
export type Route = {
    n: "auth-login";
    t: "login";
} | {
    n: "auth-login";
    t: "login-sms-request";
} | {
    n: "auth-login";
    t: "login-sms-verify";
    phoneNumber: PhoneNumber;
};
export const toRoute = P.union<Route>([
    (x) => P.obj(x) && P.tag(x, "n", "auth-login") && P.tag(x, "t", "login")
        ? x
        : null,
    (x) => P.obj(x) &&
        P.tag(x, "n", "auth-login") &&
        P.tag(x, "t", "login-sms-request")
        ? x
        : null,
    (x) => P.obj(x) &&
        P.tag(x, "n", "auth-login") &&
        P.tag(x, "t", "login-sms-verify") &&
        P.has(x, "phoneNumber", PhoneNumber.is)
        ? x
        : null,
]);
