<script lang="ts">
	import Icon, { IconName } from "./Icon.svelte";

	import Typography from "./Typography.svelte";

	export let title: string = "";
	export let iconLeft: IconName | undefined = undefined;
</script>

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

<nav>
	<Icon name={iconLeft} />
	<Typography
		variant="small-title"
		text={title}
		class="flex-1 text-align-center" />
</nav>
