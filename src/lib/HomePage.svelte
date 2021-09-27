<script lang="ts">
	import { navigate } from 'svelte-routing';
	import Button from './Button.svelte';
	import Container from './Container.svelte';
	import PageBar from './PageBar.svelte';
</script>

<PageBar title="Home" />

<Container>
	<Button fullWidth text="Play" class="margin-bottom-1" />

	<Button
		fullWidth
		text="Sign Out"
		onClick={() => {
			navigate('/unauth');
		}}
	/>
</Container>
