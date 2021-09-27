<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Container from '$lib/Container.svelte';
	import { unauthenicate } from './auth';

	const handleUnauth = async () => {
		await unauthenicate();
	};
</script>

<Container>
	<Button fullWidth text="Sign Out" onClick={handleUnauth} />
</Container>
