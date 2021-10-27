<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import "./form.css";

  import Icon from "./Icon.svelte";

  export let id = "";
  export let placeholder = "";
  export let label = "";
  export let value = "";
  export let inputMode = "";

  let className = "";
  export { className as class };

  let inputElement: HTMLInputElement;
  const dispatch = createEventDispatcher();

  const handleClear = () => {
    dispatch("clear", {});
    inputElement.focus();
    value = "";
  };

  const handleChange: svelte.JSX.EventHandler<Event, HTMLInputElement> = (
    event
  ) => {
    dispatch("change", {
      value: event.currentTarget.value,
    });
  };
</script>

<div class={className}>
  {#if label}<label for={id} class="form-label">{label}</label>{/if}

  <div class="flex items-center relative">
    <input
      bind:this={inputElement}
      class="form-box appearance-none outline-none border rounded text-base w-full py-2 px-3 flex-1 pr-12"
      {id}
      type="text"
      {placeholder}
      {inputMode}
      bind:value
      on:change={handleChange} />

    <div
      class="absolute inset-y-0 right-0 flex items-center mr-4"
      on:click={handleClear}>
      <Icon iconName="close" class="text-gray-400" />
    </div>
  </div>
</div>
