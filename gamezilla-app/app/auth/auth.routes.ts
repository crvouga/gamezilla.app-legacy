import { PhoneNumber, Result } from "gamezilla-app/@shared/core";
import { p } from "gamezilla-app/@shared/core/parser";

const Route = p.or(
	p.obj({
		n: p.l("auth-login"),
		t: p.l("login"),
	}),
	p.obj({
		n: p.l("auth-login"),
		t: p.l("login-sms-request"),
	}),
	p.obj({
		n: p.l("auth-login"),
		t: p.l("login-sms-verify"),
		phoneNumber: p.custom(PhoneNumber.is, "Invalid phone number"),
	}),
);

export type Route = p.Infer<typeof Route>;

export const toRoute = (x: unknown): Route | null =>
	Result.withDefault(Route.parse(x), null);
