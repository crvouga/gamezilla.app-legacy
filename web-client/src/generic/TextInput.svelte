<script lang="ts">
  export let id: string;
  export let placeholder: string | undefined;
  export let label: string | undefined;
  let className: string | undefined = undefined;
  export { className as class };
</script>

<input
  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  {id}
  type="text"
  {placeholder} />
