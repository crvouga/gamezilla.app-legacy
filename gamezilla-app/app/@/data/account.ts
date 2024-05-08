import type { PhoneNumber, Posix } from "gamezilla-app/@/core";
import type { UserId } from "./user-id";

export type UserAccount = {
	userId: UserId;
	createdAt: Posix;
	phoneNumber: PhoneNumber | null;
	role: "guest" | "normal" | "super";
};
