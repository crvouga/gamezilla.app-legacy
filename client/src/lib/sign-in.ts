import { dropLastWhile } from './utility';
import { supabaseClient } from './supabase-client';

export type ISignInMethod = {
	type: 'google';
	successRedirect: string;
};

const formatRedirect = (redirect: string) => {
	return dropLastWhile((_) => _ === '/', redirect.split('/')).join('');
};

export type ISignIn = (method: ISignInMethod) => Promise<{ errors: Error[] }>;

export const signIn: ISignIn = async (method) => {
	if (method.type === 'google') {
		const response = await supabaseClient.auth.signIn(
			{
				provider: 'google'
			},
			{
				redirectTo: formatRedirect(method.successRedirect)
			}
		);

		return {
			errors: [new Error(response.error.message)]
		};
	}

	return {
		errors: [new Error('Unsupported sign in method')]
	};
};
