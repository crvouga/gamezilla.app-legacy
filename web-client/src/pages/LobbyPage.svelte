<script lang="ts">
	import Button from "../generic/Button.svelte";
	import Container from "../generic/Container.svelte";
	import PageBar from "../generic/PageBar.svelte";

	export let lobbyId: string;
</script>

<PageBar title="Lobby" />

<Container>
	{lobbyId}
	<Button fullWidth text="Start Game" />
</Container>
