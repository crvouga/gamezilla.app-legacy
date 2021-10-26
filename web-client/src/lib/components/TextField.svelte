<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Clickable from "./Clickable.svelte";
  import Icon from "./Icon.svelte";

  export let id = "";
  export let placeholder = "";
  export let label = "";
  export let inputValue = "";
  export let inputMode = "";
  let className = "";
  export { className as class };

  let inputRef: HTMLInputElement;
  const dispatch = createEventDispatcher();

  const handleClear = () => {
    dispatch("clear", {});
    inputRef.focus();
  };
</script>

<div class={className}>
  {#if label}
    <label class="block text-gray-700 text-sm font-bold mb-2" for={id}>
      {label}
    </label>
  {/if}

  <div class="flex items-center relative">
    <input
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1"
      {id}
      type="text"
      {placeholder}
      {inputMode}
      bind:this={inputRef}
      bind:value={inputValue} />

    <Clickable
      on:click={handleClear}
      class="absolute top-0 right-0 h-full flex justify-center items-center mr-2">
      <Icon iconName="close" class="text-gray-400" />
    </Clickable>
  </div>
</div>
