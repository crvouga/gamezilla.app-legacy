<script lang="ts">
  export let placeholder: string | undefined;
</script>

<style>
  input {
    padding: var(--spacing);
    background-color: transparent;
    width: 100%;
    color: var(--text-color);
    font-size: 1.25em;
    border-style: solid;
    border-width: 1px;
    border-color: var(--divider-color);
  }
  input:focus {
    border-color: var(--primary);
    border-style: solid;
    border-width: 1px;
  }
</style>

<input type="text" {placeholder} />
