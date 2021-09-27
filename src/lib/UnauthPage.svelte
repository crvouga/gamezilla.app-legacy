<script lang="ts">
	import { unauthenticate } from './auth';
	import Button from './Button.svelte';
	import Modal from './Modal.svelte';
	import Typography from './Typography.svelte';
	import { navigate } from 'svelte-routing';
</script>

<Modal state="opened">
	<Typography
		text="Sign out of Gamezilla?"
		variant="medium-title"
		class="padding-1 margin-bottom-1"
	/>
	<Button
		fullWidth
		text="Cancel"
		class="margin-bottom-1"
		onClick={() => {
			navigate('/');
		}}
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
