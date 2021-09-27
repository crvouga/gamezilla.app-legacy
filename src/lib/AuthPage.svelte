<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Container from '$lib/Container.svelte';
	import Typography from '$lib/Typography.svelte';
	import { authenicate, IAuthMethod } from './auth';
	import PageBar from './PageBar.svelte';

	let state: 'idle' | 'loading' = 'idle';

	const handleAuth = (authMethod: IAuthMethod) => async () => {
		state = 'loading';

		await authenicate({ authMethod });

		state = 'idle';
	};
</script>

<PageBar title="Gamezilla" />

<Container>
	<Button
		{state}
		fullWidth
		text="Continue With Google"
		onClick={handleAuth('google')}
		class="margin-bottom-1"
		iconName="google"
	/>
</Container>
