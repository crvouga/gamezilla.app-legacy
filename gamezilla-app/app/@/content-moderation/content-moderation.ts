import { Result } from "gamezilla-app/@/core";

export type IContentModeration = {
	isBad: (text: string) => Promise<Result<string, boolean>>;
};
