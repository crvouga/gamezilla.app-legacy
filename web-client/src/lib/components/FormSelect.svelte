<script lang="ts">
  import "./form.css";

  export let label = "";
  export let value = "";
  let className = "";
  export { className as class };
</script>

<div class={className}>
  {#if label}<label for="select" class="form-label"> {label} </label>{/if}

  <select id="select" bind:value class="form-box ">
    <slot />
  </select>
</div>
