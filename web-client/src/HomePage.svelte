<script lang="ts">
	import { navigate } from 'svelte-routing';
	import Button from './generic/Button.svelte';
	import Container from './generic/Container.svelte';
	import PageBar from './generic/PageBar.svelte';
</script>

<PageBar title="Home" />

<Container>
	<Button
		fullWidth
		text="Create Lobby"
		class="margin-bottom-1"
		onClick={() => {
			navigate('/lobby');
		}}
	/>

	<Button
		fullWidth
		text="Sign Out"
		onClick={() => {
			navigate('/unauth');
		}}
	/>
</Container>
