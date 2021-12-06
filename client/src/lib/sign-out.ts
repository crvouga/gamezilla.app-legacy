import { supabaseClient } from './supabase-client';

export const signOut = async (): Promise<{ errors: Error[] }> => {
	const { error } = await supabaseClient.auth.signOut();

	if (error) {
		return {
			errors: [new Error(error.message)]
		};
	}

	return {
		errors: []
	};
};
