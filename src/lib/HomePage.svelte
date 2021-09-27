<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Container from '$lib/Container.svelte';
	import { unauthenicate } from './auth';
	import PageBar from './PageBar.svelte';

	const handleUnauth = async () => {
		await unauthenicate();
	};
</script>

<PageBar title="Home" />

<Container>
	<Button fullWidth text="Sign Out" onClick={handleUnauth} />
</Container>
