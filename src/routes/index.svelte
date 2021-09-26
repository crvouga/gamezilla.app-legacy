<script lang="ts" context="module">
	import AuthPage from '$lib/AuthPage.svelte';
	import '../app.css';
	export const prerender = true;
</script>

<svelte:head>
	<title>gamezilla</title>
	<meta name="description" content="Play games with your friends" />
</svelte:head>

<AuthPage />
