<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Container from '$lib/Container.svelte';
	import Typography from '$lib/Typography.svelte';
	import { authenicate, IAuthMethod } from './auth';
	import PageBar from './PageBar.svelte';

	const handleAuth = (authMethod: IAuthMethod) => async () => {
		await authenicate({ authMethod });
	};
</script>

<PageBar title="Gamezilla" />

<Container>
	<Button
		fullWidth
		text="Continue With Google"
		onClick={handleAuth('google')}
		class="margin-bottom-1"
		iconName="google"
	/>
</Container>
