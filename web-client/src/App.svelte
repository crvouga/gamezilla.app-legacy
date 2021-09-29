<script lang="ts">
	import { browser, dev } from "$app/env";
	import { setContext } from "svelte";
	import { Route, Router } from "svelte-routing";
	import { writable } from "svelte/store";
	import "./app.css";
	import {
		AuthDataAccess,
		AuthDataAccessNoop,
		IAuthState,
	} from "./auth/auth-data-access";
	import AuthPage from "./auth/AuthPage.svelte";
	import UnauthPage from "./auth/UnauthPage.svelte";
	import { FirebaseApp } from "./firebase-app";
	import HomePage from "./HomePage.svelte";
	import LoadingPage from "./LoadingPage.svelte";
	import LobbyPage from "./LobbyPage.svelte";

	const authStateStore = writable<IAuthState>({
		status: "loading",
	});

	setContext("auth", {
		authStateStore,
		authDataAccess: AuthDataAccessNoop(),
	});

	if (browser) {
		const firebaseApp = FirebaseApp();

		const authDataAccess = AuthDataAccess({
			firebaseApp,
			emulate: dev,
		});

		authDataAccess.onAuthStateChanged(authStateStore.set);

		setContext("auth", {
			authStateStore,
			authDataAccess,
		});
	}
</script>

{#if $authStateStore.status === 'loading'}
	<LoadingPage />
{:else if $authStateStore.status === 'unauthenticated'}
	<AuthPage />
{:else if $authStateStore.status === 'authenticated'}
	<Router>
		<Route path="/lobby" component={LobbyPage} />
		<Route path="/unauth" component={UnauthPage} />
		<Route path="/" component={HomePage} />
	</Router>
{/if}
