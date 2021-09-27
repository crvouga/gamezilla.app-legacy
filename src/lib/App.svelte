<script lang="ts" context="module">
	export const ssr = false;
</script>

<script lang="ts">
	import { authStateStore } from '$lib/auth';
	import AuthPage from '$lib/AuthPage.svelte';
	import HomePage from '$lib/HomePage.svelte';
	import LoadingPage from '$lib/LoadingPage.svelte';
</script>

{#if $authStateStore.status === 'loading'}
	<LoadingPage />
{:else if $authStateStore.status === 'unauthenticated'}
	<AuthPage />
{:else if $authStateStore.status === 'authenticated'}
	<HomePage />
{/if}
