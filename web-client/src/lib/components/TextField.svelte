<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Clickable from "./Clickable.svelte";
  import Icon from "./Icon.svelte";

  export let id: string;
  export let placeholder: string | null = null;
  export let label: string | null = null;
  export let pattern: RegExp | null = null;
  export let inputValue: string = "";
  export let inputMode: string = "";
  let inputType: string = "text";
  let className: string | null = null;
  export { className as class, inputType as type };

  let inputRef: HTMLInputElement;
  const dispatch = createEventDispatcher();

  const handleClear = () => {
    dispatch("clear", {});
    inputRef.focus();
  };
</script>

<div class="mb-4">
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
      {pattern}
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
