import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data";
import { P } from "gamezilla-app/@SHARED/parsing";
export type Route = {
    n: "spaces";
    t: "space-list";
} | {
    n: "spaces";
    t: "space";
    spaceId: SpaceId;
};
export const toRoute = P.union<Route>([
    (x) => P.obj(x) && P.tag(x, "n", "spaces") && P.tag(x, "t", "space-list")
        ? x
        : null,
    (x) => P.obj(x) &&
        P.tag(x, "n", "spaces") &&
        P.tag(x, "t", "space") &&
        P.has(x, "spaceId", SpaceId.is)
        ? x
        : null,
]);
