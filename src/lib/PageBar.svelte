<script lang="ts">
	import Typography from './Typography.svelte';

	export let title: string = '';
</script>

<nav>
	<Typography variant="small-title" text={title} />
</nav>

<style>
	nav {
		height: calc(var(--spacing) * 3);
		width: 100%;
		border-bottom: 1px solid var(--divider-color);
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
