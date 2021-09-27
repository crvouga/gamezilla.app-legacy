<script lang="ts">
	import { browser } from '$app/env';
	import App from '$lib/App.svelte';
	import LoadingPage from '$lib/LoadingPage.svelte';
	import '../app.css';
</script>

{#if browser}
	<App />
{:else}
	<LoadingPage />
{/if}
