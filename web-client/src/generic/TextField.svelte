<script lang="ts">
  export let id: string;
  export let placeholder: string | undefined;
  export let label: string | undefined;

  let inputType: string = "text";
  let className: string | undefined = undefined;
  export { className as class, inputType as type };
</script>

<div class="mb-4">
  {#if label}
    <label class="block text-gray-700 text-sm font-bold mb-2" for={id}>
      {label}
    </label>
  {/if}
  <input
    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    {id}
    type={inputType}
    {placeholder} />
</div>
