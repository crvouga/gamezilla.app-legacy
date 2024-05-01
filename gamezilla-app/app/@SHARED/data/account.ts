import type { Posix } from "gamezilla-app/@shared/core";
import type { UserId } from "./user-id";

export type UserAccount = {
	userId: UserId;
	createdAt: Posix;
	role: "guest" | "normal" | "super";
};
