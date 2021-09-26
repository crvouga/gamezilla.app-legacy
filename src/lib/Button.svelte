<script lang="ts">
	export let text: string;
	export let fullWidth = false;
	export let onClick: () => void;

	let classProp: string = '';
	export { classProp as class };

	$: buttonClass = `${fullWidth ? 'full-width' : ''} ${classProp ?? ''}`;
</script>

<button class={buttonClass} on:click={onClick}>
	{text}
</button>

<style>
	.full-width {
		width: 100%;
	}

	button {
		border: none;
		font-family: var(--font-family);
		cursor: pointer;
		padding: var(--spacing);
		border-radius: 0.5rem;
		font-weight: bold;
		font-size: large;
		color: white;
		background-color: var(--primary);
		text-transform: uppercase;
	}

	button:active {
		box-shadow: inset 6px 6px 12px rgba(0, 0, 0, 0.5);
		filter: brightness(0.6);
	}
</style>
