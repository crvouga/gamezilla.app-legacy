import { readable } from 'svelte/store';
import { initializeApp } from 'firebase/app';
import {
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
	signInWithRedirect,
	getAuth
} from 'firebase/auth';

const firebaseConfig = {
	apiKey: 'AIzaSyAdO_pbFEFwdkWqcRIFABFD_OXNRlXMzis',
	authDomain: 'gamezilla.firebaseapp.com',
	databaseURL: 'https://gamezilla-default-rtdb.firebaseio.com',
	projectId: 'gamezilla',
	storageBucket: 'gamezilla.appspot.com',
	messagingSenderId: '58925712607',
	appId: '1:58925712607:web:66f1037547a45bf69a556a',
	measurementId: 'G-P243F70BSW'
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

export type IAuthMethod = 'google';

export const authenicate = async ({
	authMethod
}: {
	authMethod: IAuthMethod;
}): Promise<Error[]> => {
	if (authMethod === 'google') {
		try {
			await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
			return [];
		} catch (error) {
			return [error];
		}
	}

	return [new Error(`${authMethod} is an unsupported authentication method`)];
};

type IAuthUser = {
	displayName?: string;
	userId: string;
	avatarUrl?: string;
};

type IAuthState =
	| {
			status: 'loading';
	  }
	| {
			status: 'authenticated';
			authUser: IAuthUser;
	  }
	| {
			status: 'unauthenticated';
	  };

export const authStateStore = readable<IAuthState>({ status: 'loading' }, (set) => {
	set({ status: 'loading' });

	const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
		if (firebaseUser) {
			set({
				status: 'authenticated',
				authUser: {
					userId: firebaseUser.uid,
					displayName: firebaseUser.displayName,
					avatarUrl: firebaseUser.photoURL
				}
			});
			return;
		}

		set({
			status: 'unauthenticated'
		});
	});

	return () => {
		unsubscribe();
	};
});

export const unauthenicate = async (): Promise<void> => {
	await signOut(firebaseAuth);
};
