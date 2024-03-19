import { UserId, Username } from "gamezilla-app/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla-app/@SHARED/core";
import { LanguageCodeISO_639_1 } from "gamezilla-app/@SHARED/l18n";
import { Translator } from "gamezilla-app/@SHARED/l18n/generated";
import { Route } from "gamezilla-app/@SHARED/routing/generated/routes";
type Profile = {
    userId: UserId;
    username: Username;
    avatarUrl: string;
};
export type BaseClientCtx = {
    navigatorLanguage: LanguageCodeISO_639_1;
    t: Translator;
    currentRoute: Route;
    now: Posix;
    currentUserId?: UserId | null;
    profiles: {
        [userId: UserId]: Profile;
    };
    documentVisibilityState: DocumentVisibilityState;
};
export type AnonymousClientCtx = BaseClientCtx & {
    currentUserId: null;
};
export const isAnonymous = (ctx: BaseClientCtx): ctx is AnonymousClientCtx => {
    return ctx.currentUserId === null;
};
export type ClientCtx = BaseClientCtx & {
    currentUserId: UserId;
};
