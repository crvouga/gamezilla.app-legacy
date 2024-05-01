import { Result } from "gamezilla-app/@shared/core";
import { p } from "gamezilla-app/@shared/core/parser";

const Route = p.obj({
	n: p.l("lang"),
	t: p.l("choose-lang"),
});

export type Route = p.Infer<typeof Route>;

export const toRoute = (x: unknown): Route | null =>
	Result.withDefault(Route.parse(x), null);
