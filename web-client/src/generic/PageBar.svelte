<script lang="ts">
	import type { IconName } from '../icon-name';
	import Icon from './Icon.svelte';

	import Typography from './Typography.svelte';

	export let title: string = '';
	export let iconLeft: IconName;
</script>

<nav>
	<Icon name={iconLeft} />
	<Typography variant="small-title" text={title} class="flex-1 text-align-center" />
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
