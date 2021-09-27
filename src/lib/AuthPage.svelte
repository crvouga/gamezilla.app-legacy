<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Container from '$lib/Container.svelte';
	import Typography from '$lib/Typography.svelte';
	import { authenicate, IAuthMethod } from './auth';

	const handleAuth = (authMethod: IAuthMethod) => async () => {
		await authenicate({ authMethod });
	};
</script>

<Container>
	<Typography variant="title" text="Gamezilla" class="margin-bottom-1" />

	<Button
		fullWidth
		text="Continue With Google"
		onClick={handleAuth('google')}
		class="margin-bottom-1"
		iconName="google"
	/>
</Container>
