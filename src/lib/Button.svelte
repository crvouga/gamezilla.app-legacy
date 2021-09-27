<script lang="ts">
	import type { IconName } from './icon-name';
	import Icon from './Icon.svelte';

	export let text: string;
	export let variant: 'text' | 'contained' | 'outlined' = 'contained';
	export let color: 'primary' | 'danger' = 'primary';
	export let fullWidth = false;
	export let onClick: () => void;
	export let iconName: IconName;

	let classProp: string = '';
	export { classProp as class };

	$: buttonClass = `${fullWidth ? 'full-width' : ''} ${color} ${variant} ${classProp ?? ''}`;

	const buttonColor =
		color === 'primary' ? 'var(--primary)' : color === 'danger' ? 'var(--danger-color)' : '';
</script>

<button style={`--button-color: ${buttonColor}`} class={buttonClass} on:click={onClick}>
	{#if iconName}
		<Icon class="icon" name={iconName} />
	{/if}

	{text}
</button>

<style>
	.icon {
		margin-right: var(--spacing);
	}

	.full-width {
		width: 100%;
	}

	.text {
		color: var(--button-color);
		background-color: transparent;
	}

	.contained {
		color: white;
		background-color: var(--button-color);
	}

	button {
		border: none;
		font-family: var(--font-family);
		cursor: pointer;
		padding: var(--spacing);
		border-radius: var(--border-radius);
		font-weight: bold;
		font-size: medium;
		text-transform: uppercase;
	}

	.outlined {
		color: var(--button-color);
		background-color: transparent;
		border: 1px solid var(--button-color);
	}

	button:active {
		filter: brightness(0.6);
	}
</style>
