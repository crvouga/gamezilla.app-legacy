import { EmailAddress, PhoneNumber, Posix } from "gamezilla-app/@SHARED/core";
import { UserId } from "./user-id";
type PhoneNumberOrEmail = {
    phoneNumber?: PhoneNumber | null;
    emailAddress: EmailAddress;
} | {
    phoneNumber: PhoneNumber;
    emailAddress?: EmailAddress | null;
} | {
    phoneNumber: PhoneNumber;
    emailAddress: EmailAddress;
};
type GuestAccount = {
    role: "guest";
    phoneNumber?: PhoneNumber | null;
    emailAddress?: EmailAddress | null;
};
type NormalAccount = PhoneNumberOrEmail & {
    role: "normal";
};
type SuperAccount = PhoneNumberOrEmail & {
    role: "super";
};
type AccountVariant = GuestAccount | NormalAccount | SuperAccount;
type AccountBase = {
    userId: UserId;
    createdAt: Posix;
};
export type Account = AccountBase & AccountVariant;
