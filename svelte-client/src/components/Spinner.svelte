<script lang="ts">
  let className = "";
  export { className as class };
</script>

<style>
  .spinner {
    border-width: 6px;
  }
</style>

<div
  class="spinner animate-spin rounded-full border-slate-300 border-t-blue-500 w-10 h-10 {className}" />
