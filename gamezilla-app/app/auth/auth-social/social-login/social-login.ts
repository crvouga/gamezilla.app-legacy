import type {
	EmailAddress,
	RemoteResult,
	Result,
} from "gamezilla-app/@/core";

type SocialLoginProvider = "google";

export type SocialLogin = {
	/**
	 * Redirects the user to the social login provider's website.
	 */
	redirectSocialLogin: (input: {
		provider: SocialLoginProvider;
	}) => Promise<Result<string, null>>;
	/**
	 * Returns the result of the social login redirect.
	 */
	getSocialLoginResult: () => Promise<RemoteResult<string, EmailAddress>>;
};
