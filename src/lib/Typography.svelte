<script lang="ts">
	export let text: string;
	export let variant: 'title' | 'small-title' | 'body' = 'body';

	let classProp: string = '';
	export { classProp as class };
</script>

{#if variant === 'title'}
	<h1 class={classProp}>{text}</h1>
{:else if variant === 'small-title'}
	<h6 class={classProp}>{text}</h6>
{:else if variant === 'body'}
	<p class={classProp}>{text}</p>
{/if}

<style>
	h1 {
		font-size: xx-large;
	}

	h6 {
		font-size: large;
	}

	p {
		font-size: medium;
	}
</style>
