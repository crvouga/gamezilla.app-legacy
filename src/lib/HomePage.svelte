<script lang="ts">
	import { unauthenticate } from './auth';
	import Button from './Button.svelte';
	import Container from './Container.svelte';
	import Modal from './Modal.svelte';
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
	<Modal state={dialogState}>
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
	</Modal>
</Container>
