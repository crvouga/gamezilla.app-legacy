import { Result } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { VerificationId } from "./auth-sms/verify-sms/verification";

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
		verificationId: VerificationId
	}),
);

export type Route = p.Infer<typeof Route>;

export const toRoute = (x: unknown): Route | null =>
	Result.withDefault(Route.parse(x), null);
