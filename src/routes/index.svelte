<script lang="ts" context="module">
	import '../app.css';
	export const prerender = true;
</script>

<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Container from '$lib/Container.svelte';
	import Typography from '$lib/Typography.svelte';

	const handleAuth = (authMethod: 'google' | 'phone' | 'email') => () => {
		console.log(`auth with ${authMethod}`);
	};
</script>

<svelte:head>
	<title>gamezilla</title>
	<meta name="description" content="Play games with your friends" />
</svelte:head>

<Container>
	<Typography variant="title" text="Gamezilla" class="margin-bottom-1" />

	<Button
		fullWidth
		text="Continue With Google"
		onClick={handleAuth('google')}
		class="margin-bottom-1"
	/>
	<Button
		fullWidth
		text="Continue With Phone"
		onClick={handleAuth('phone')}
		class="margin-bottom-1"
	/>
	<Button
		fullWidth
		text="Continue With Email"
		onClick={handleAuth('email')}
		class="margin-bottom-1"
	/>
</Container>
