<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Container from '$lib/Container.svelte';
	import { unauthenticate } from './auth';
	import Dialog from './Dialog.svelte';
	import PageBar from './PageBar.svelte';
	import Typography from './Typography.svelte';

	let dialogState: 'closed' | 'opened' = 'closed';
</script>

<PageBar title="Home" />

<Container>
	<Button
		fullWidth
		text="Sign Out"
		onClick={() => {
			dialogState = 'opened';
		}}
	/>
	<Dialog state={dialogState}>
		<Typography
			text="Sign out of Gamezilla?"
			variant="medium-title"
			class="padding-1 margin-bottom-1"
		/>
		<Button
			fullWidth
			onClick={() => {
				dialogState = 'closed';
			}}
			text="Cancel"
			class="margin-bottom-1"
		/>

		<Button
			fullWidth
			onClick={() => {
				unauthenticate();
			}}
			text="Sign Out"
			class="margin-bottom-1"
		/>
	</Dialog>
</Container>
